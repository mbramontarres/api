import { ApiPromise } from "@polkadot/api";
import mongoose from "mongoose";
import { ExtrinsicType } from "../../src/extrinsic/extrinsic.dto";
import { ExtrinsicSchema } from "../../src/extrinsic/extrinsic.schema";
import { EventSchema } from "../../src/event/event.schema";
import { EventType } from "../../src/event/event.dto";
import { EventRecord } from '@polkadot/types/interfaces';
import { LogType } from "../../src/log/log.dto";

import { TransferSchema } from "../../src/transfer/transfer.schema";
import { TransferType } from "../../src/transfer/dto/transfer.dto";
import { AccountSchema } from "../../src/account/account.schema";
import { AccountType } from "../../src/account/dto/account.dto";

export const getAccountProperies = async(api: ApiPromise,account: string): Promise<AccountType> => {
    const acc = new AccountType;

    const balance = await api.derive.balances.all(account);
    acc.accountId =  balance.accountId.toHuman();
    acc.availableBalance = balance.availableBalance.toString();
    acc.freeBalance = balance.freeBalance.toString();
    acc.lockedBalance = balance.lockedBalance.toString();
    acc.reservedBalance = balance.reservedBalance.toString();
    acc.totalBalance = balance.freeBalance.add(balance.reservedBalance).toString();
    acc.nonce = balance.accountNonce.toNumber();

    return acc;
}

export const addOrReplaceAccount = async (api: ApiPromise,account: string,db, updateAccounts: boolean): Promise<void> =>{
    const Addressmodel =  db.model('accounts', AccountSchema);

    const acc = await getAccountProperies(api,account);

    //mongoose.set('debug', true);
    if(updateAccounts){
        await Addressmodel.updateOne({accountId: acc.accountId.toString()},acc,{upsert: true});
    }
    else{
        //only insert if it doesn't exist
        await Addressmodel.updateOne({accountId: acc.accountId.toString()},{$setOnInsert:acc},{upsert: true});
    }
    
    //mongoose.set('debug', false);

}

export const addLogs = async (Logsmodel,extendedBlock,block,blockNum): Promise<void> =>{
    
    const logs = extendedBlock.block.header.digest.logs;
    block.logs = [];
    logs.forEach(async (l,index)=> {
        const log = new LogType;
        log.blockNum = blockNum;
        log.logIndex = index;
        log.logType = l.type;
        //log.engine = ----
        //log.data = l.

        const createdLog = new Logsmodel(log);
        await Logsmodel.updateOne({blockNum: log.blockNum},log,{upsert: true});

        block.logs.push(createdLog);

    });

}

export const addTransfer = async (Transfermodel,db,extr,feeInfo, allevents: EventRecord[]): Promise<void> =>{
    
    const transfer = new TransferType;

    transfer.blockNum = extr.blockNum;
    transfer.blockTimestamp = extr.blockTimestamp;
    transfer.section = extr.section;
    transfer.method = extr.method;
    transfer.hash = extr.extrinsicHash;
    transfer.events = extr.events;
    transfer.success = extr.success;
    transfer.source = extr.signer;
    //const args = extrinsic.method.args;
    if (JSON.parse(extr.params)[0].id) {
        transfer.destination = JSON.parse(extr.params)[0].id;
        } else if (JSON.parse(extr.params)[0].address20) {
        transfer.destination = JSON.parse(extr.params)[0].address20;
        } else {
        transfer.destination = JSON.parse(extr.params)[0];
    }
    
    if (extr.method === 'transferAll' && extr.success) {
        //revisar
        const eventsfind = await allevents.find(({ event }) =>
            event.section === 'balances' &&
            event.method === 'Transfer',
        );
        transfer.amount = JSON.parse(eventsfind.event.data[2].toString());
        } else if (extr.method === 'transferAll' && !extr.success) {
        transfer.amount = 0; //Si ha fallat no tenim amount.
        } else if (extr.method === 'forceTransfer') {
        transfer.amount = JSON.parse(extr.params)[2];
        } else {
        transfer.amount = JSON.parse(extr.params)[1]; 
        }

        //si no està signat no tenim fee
        let info = await feeInfo;
        //console.log(info.toJSON().partialFee)  
            transfer.fee = !! await feeInfo
            ? info.toJSON().partialFee
            : 0;
        
    //const createdTransfer = new Transfermodel(transfer);
    await Transfermodel.updateOne({hash: transfer.hash},transfer,{upsert: true});
    //createdTransfer.save();
}
export const processBlockData = async (api: ApiPromise,db, extrinsics,allevents,blockNum,blockHash,block,timestamp, updateAccount:boolean): Promise<void> =>{
    const Transfermodel =  db.model('transfers', TransferSchema);

    const Eventmodel = db.model('events',EventSchema);
    
    var i = 0;
    try{
        extrinsics.forEach( (extrinsic,index) => {
            const extr = new ExtrinsicType;
            extr.section =  extrinsic.method.section;
            extr.blockTimestamp = timestamp;
            extr.method = extrinsic.method.method;
            extr.blockNum = blockNum;
            extr.signer = extrinsic.isSigned? extrinsic.signer.toString() : '';
            extr.extrinsicHash = extrinsic.hash.toHex();
            extr.extrinsicIndex = index;
            extr.params = JSON.stringify(extrinsic.method.args);
            let feeInfo = null;
            if(extrinsic.isSigned){
                //extr.nonce = extrinsic.nonce.toString();
                feeInfo =  api.rpc.payment.queryInfo(extrinsic.toHex(),blockHash);
                //extr.fee = feeinfo.
            }
            //console.log("extrinsic: "+extr.extrinsicIndex+ " block:"+ extr.blockNum);
            //Processar events de l'extrinsic
            const events = allevents.filter(({ phase }) =>phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index));
            
            const allaccounts = []
            extr.events = [];
            
            events.forEach(e => {
            const event = new EventType;
             //Falten parametres
             event.blockNum = blockNum;
             event.extrinsicIndex = extr.extrinsicIndex;
             event.eventIndex = i;
             event.section = e.event.section;
             event.method = e.event.method;
             event.phase = e.phase.toString();
             event.doc = JSON.stringify(e.event.meta.docs.toJSON());
             //event.blockTimestamp = timestamp;
    
    
            //look extrinsic success
            if (api.events.system.ExtrinsicSuccess.is(e.event)) {
                extr.success = true;
            } 
            else{
                extr.success = false;
            }
    
    
            //Accounts
            if(extr.section === 'balances'){
                const types = e.event.typeDef;
                e.event.data.forEach((d,i) => {
                    if ( types[i].type === 'AccountId32'){
                        if(!allaccounts.includes(d.toString())){
                            allaccounts.push(d.toString());
                        }
                    }
                });
            }
    
            
    
             
             Eventmodel.updateOne({blockNum: event.blockNum,eventIndex: event.eventIndex },event,{upsert: true});
             //createdEvent.save();
             i++;
             //console.log("extrinsic: "+event.extrinsicIndex+ " events:"+ event.eventIndex);
             const createdEvent = new Eventmodel(event);
             block.events.push(createdEvent);
             extr.events.push(createdEvent);
            });
    
    
            //Add Accounts
            Promise.all(allaccounts.map((acc) =>addOrReplaceAccount(api,acc,db,updateAccount)));
            //Afegir transferència si ho és
            if (extr.section === 'balances' && 
                (extr.method === 'forceTransfer' ||
                extr.method === 'transfer' ||
                extr.method === 'transferAll' ||
                extr.method === 'transferKeepAlive')) 
            {
                //Add Transfer
                addTransfer(Transfermodel,db,extr,feeInfo,allevents)
            }


            
            
           // console.log(extr.extrinsicIndex);
           //console.log("extrinsic: "+extr.extrinsicIndex+ " blocks:"+ extr.blockNum);
            //createdExtrinsic.save();
            //Guardem referencia extrinsic a block
            //createdExtrinsic.save();
            //mongoose.set('debug', true);
            insertExtrinsic(db,extr,block);
            
            //mongoose.set('debug', false);
            //console.log("extrinsic afegit");
            //const createdExtrinsic;
            //block.extrinsics.push(extr);
            //save created
         });
         
    }
    catch(e){
        console.log("hola");
    }
    
}

async function insertExtrinsic(db,extr,block) {
    const Extmodel = db.model('extrinsics',ExtrinsicSchema);
    const extrinsic = await Extmodel.updateOne({extrinsicHash: extr.extrinsicHash},extr,{upsert: true});
    block.extrinsics.push(extrinsic.upsertedId);
    //console.log(extrinsic);
}
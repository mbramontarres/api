import { ApiPromise } from "@polkadot/api";
import mongoose from "mongoose";
import { ExtrinsicType } from "../../src/extrinsic/dto/extrinsic.dto";
import { ExtrinsicSchema } from "../../src/extrinsic/extrinsic.schema";
import { EventSchema } from "../../src/event/event.schema";
import { EventType } from "../../src/event/dto/event.dto";
import { EventRecord, BlockHash } from '@polkadot/types/interfaces';


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


export const addTransfer = async (Transfermodel,extr,signer,feeInfo, allevents: EventRecord[]): Promise<void> =>{
    
    const transfer = new TransferType;

    transfer.blockNum = extr.blockNum;
    transfer.blockTimestamp = extr.blockTimestamp;
    transfer.section = extr.section;
    transfer.method = extr.method;
    transfer.hash = extr.extrinsicHash;
    transfer.events = extr.events;
    transfer.success = extr.success;
    transfer.source = signer;
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
    } 
    else if (extr.method === 'transferAll' && !extr.success) {
        transfer.amount = 0; //Si ha fallat no tenim amount.
    } 
    else if (extr.method === 'forceTransfer') {
        transfer.amount = JSON.parse(extr.params)[2];
    } 
    else {
        transfer.amount = JSON.parse(extr.params)[1]; 
    }

        //si no està signat no tenim fee
        let info = await feeInfo;
        transfer.fee = !! await feeInfo? info.toJSON().partialFee: 0;
        
    await Transfermodel.updateOne({hash: transfer.hash},transfer,{upsert: true});

}
export const processBlockData = async (api: ApiPromise,db, extrinsics,allevents,blockNum,blockHash,block,timestamp, updateAccount:boolean)=>{
    const Transfermodel =  db.model('transfers', TransferSchema);
    const Extmodel = db.model('extrinsics',ExtrinsicSchema);
    const Eventmodel = db.model('events',EventSchema);
    var i = 0;
    try{
        var index = 0;
        for (const extrinsic of extrinsics) {
            const extr = new ExtrinsicType;
            extr.section =  extrinsic.method.section;
            extr.blockTimestamp = timestamp;
            extr.method = extrinsic.method.method;
            extr.blockNum = blockNum;
            extr.doc = JSON.stringify(extrinsic.meta.docs.toJSON());
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
            for(const e of events){
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
                event.data = JSON.stringify(e.event.data);
        
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
                
                i++;
                const createdEvent = await Eventmodel.updateOne({blockNum: event.blockNum, eventIndex:event.eventIndex},{$setOnInsert:event},{upsert: true});

                block.events.push(createdEvent.upsertedId);
                extr.events.push(createdEvent.upsertedId);
            }
    
    
            //Add Accounts
            Promise.all(allaccounts.map((acc) =>addOrReplaceAccount(api,acc,db,updateAccount)));
            //Afegir transferència si ho és
            if (extr.section === 'balances' && (extr.method === 'forceTransfer' ||
                extr.method === 'transfer' ||
                extr.method === 'transferAll' ||
                extr.method === 'transferKeepAlive')) 
            {
                //Add Transfer
                const signer = extrinsic.isSigned ? extrinsic.signer.toString() : '';
                addTransfer(Transfermodel,extr,signer,feeInfo,allevents)
            }
            //Add Extrinsic
            const createdExtrinsic = await Extmodel.updateOne({blockNum: extr.blockNum,extrinsicIndex:extr.extrinsicIndex},{$setOnInsert:extr},{upsert: true});
            block.extrinsics.push(createdExtrinsic .upsertedId);
            index++;
        }

    }
    catch(e){
        console.log("Alguna cosa ha fallat al processar les dades d'un block.");
    }
    
}


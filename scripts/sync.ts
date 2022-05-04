//@ts-check

import { ApiPromise, WsProvider } from "@polkadot/api";
import mongoose from "mongoose";
import { BlockType } from "../src/block/dto/block.dto";
import { Block, BlockDocument, BlockSchema } from "../src/block/block.schema";
import { ExtrinsicType } from "../src/extrinsic/extrinsic.dto";
import { ExtrinsicSchema } from "../src/extrinsic/extrinsic.schema";
import { EventSchema } from "../src/event/event.schema";
import { EventType } from "../src/event/event.dto";
import { LogSchema } from "../src/log/log.schema";
import { LogType } from "../src/log/log.dto";
import config from "../config/config";
import { TransferSchema } from "../src/transfer/transfer.schema";
import { TransferType } from "../src/transfer/dto/transfer.dto";

async function Run(){
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });


    const db = await mongoose.connect(config.mongoDBConstring);
    mongoose.connection
        .once("open", () => console.log("Connected to Database"))
        .on("error", error => {
            console.log("Couldn't connect to MongoDb Database",error);
        });

        /*const [
            res1,
            res2
        ] = await Promise.all([
            asyncCall1(),
            asyncCall1(),
        ]);*/
    const chain = await api.rpc.system.chain();
    await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
        console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

        //Provar
        //await Promise.all([addBlocksDb(db,api,lastHeader.number.toNumber()),findGaps(db,api,lastHeader.number.toNumber())])

        //Guardar blocks en un gridfs

        /*if((await db.model('blocks',BlockSchema).find()).length == 0){
            await addBlocksDb(db,api,lastHeader.number.toNumber());
        }*/
        //prova
        //let users = await api.query.system.account.keys();
        //console.log(users.length);
       await addBlocksDb(db,api,lastHeader.number.toNumber());
        /*else{
            //Find block gaps in db
            const gaps = await db.model('blocks',BlockSchema).aggregate([
                {$group : {_id : null, min : {$min : "$blockNum"}, max : {$max : "$lastHeader.number"}}},
                {$addFields : {rangeNums : {$range : ["$min", "$max"]}}},
                {$lookup : {from : "blocks", localField : "rangeIds", foreignField : "blockNum", as : "blocks"}},
                {$project : {_id :0, missingIds : {$setDifference : ["$rangeIds", "$blocks.blockNum"]}}}
            ]);
            console.log(`Gaps:${gaps}"`);
            gaps.forEach(async gap => {
                
                await addBlocksDb(db,api,gap);

            });
        }*/
        


    });

}

async function findGaps(db,api: ApiPromise, lastHeader){
    const gaps =  await db.model('blocks',BlockSchema).aggregate([
        {
          $group: {_id: null, nos: {$push: "$blockNum"}}
        },
        {
          $addFields: {missing: {$setDifference: [{$range: [0,lastHeader]},"$nos"]}}
        }])
    
    gaps.forEach(gap => {
        addBlocksDb(db,api,gap);
    });
}

async function addBlocksDb(db,api: ApiPromise,gap) {
     //db.model('blocks', mongoose.Schema.)
     const Blockmodel =  db.model('blocks', BlockSchema);
     const Extmodel = db.model('extrinsics',ExtrinsicSchema);
     const Transfermodel =  db.model('transfers', TransferSchema);
     const Eventmodel = db.model('events',EventSchema);
     const Logsmodel = db.model('logs',LogSchema);
     const extr = new ExtrinsicType;
     const event = new EventType;
     const block = new BlockType;
     const log = new LogType;
     
     


     //Get Block Hash
     const blockHash = await api.rpc.chain.getBlockHash(gap);
     //Get block
     const CurrentBlock = await api.rpc.chain.getBlock(blockHash);
     //Extended block
     const extendedBlock = await api.derive.chain.getBlock(blockHash);
     //Get BlockApi
     const apiblock  = await api.at(blockHash);
     //get extended header for author.
     const extendedHeader = await api.derive.chain.getHeader(blockHash);
     const runtime = await api.rpc.state.getRuntimeVersion(blockHash);
     const timestamp = gap !== 0? parseInt(extendedBlock.block.extrinsics.find(({ method: { section, method } }) => section === 'timestamp' && method === 'set',).args[0].toString(),10,) : 0;


     block.blockHash = blockHash.toHex();
     block.blockNum = gap;
     block.parentHash = CurrentBlock.block.header.parentHash.toHex();
     block.extrinsicsRoot = CurrentBlock.block.header.extrinsicsRoot.toHex();
     block.stateRoot = CurrentBlock.block.header.stateRoot.toHex();
     block.blockAuthor = extendedBlock.author.toHex();
     block.eventCount = extendedBlock.events.length;
     block.extrinsicsCount = extendedBlock.block.extrinsics.length;
     block.specVersion = runtime.specVersion.toNumber();
     block.finalized = false;
     block.blockTimestamp = timestamp;
     
     const allevents = extendedBlock.events;
     let extrinsics = extendedBlock.block.extrinsics;
     block.extrinsics = [];
     block.events = [];
     //Afegir parametres que falten
     extrinsics.forEach(async (extrinsic,index) => {
        extr.section =  extrinsic.method.section;
        extr.blockTimestamp = timestamp;
        extr.method = extrinsic.method.method;
        extr.blockNum = gap;
        extr.signer = extrinsic.isSigned? extrinsic.signer.toString() : '';
        extr.extrinsicHash = extrinsic.hash.toHex();
        extr.extrinsicIndex = index;
        extr.params = JSON.stringify(extrinsic.method.args);
        let feeInfo = null;
        if(extrinsic.isSigned){
            extr.nonce = extrinsic.nonce.toString();
            feeInfo = await api.rpc.payment.queryInfo(extrinsic.toHex(),blockHash);
            //extr.fee = feeinfo.
        }

        //Processar events
        const events = allevents
        .filter(({ phase }) =>
          phase.isApplyExtrinsic &&
          phase.asApplyExtrinsic.eq(index)
        );
        
        extr.events = [];
        events.forEach((e,index) => {
         //Falten parametres
         event.blockNum = gap;
         event.eventIndex = index;
         event.section = e.event.section;
         event.method = e.event.method;
         event.phase = e.phase.toString();
         event.doc = JSON.stringify(e.event.meta.docs.toJSON());
         event.blockTimestamp = timestamp;
        //look extrinsic success
        if (api.events.system.ExtrinsicSuccess.is(e.event)) {
            extr.success = true;
        } 
        else{
            extr.success = false;
        }


         const createdEvent = new Eventmodel(event);
         createdEvent.save();

         block.events.push(createdEvent);
         extr.events.push(createdEvent);
        });

        if (extr.section === 'balances' && (extr.method === 'forceTransfer' ||
            extr.method === 'transfer' ||
            extr.method === 'transferAll' ||
            extr.method === 'transferKeepAlive')) 
        {
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
                // Equal source and destination addres doesn't trigger a balances.Transfer event
                transfer.amount =JSON.parse(extr.params)[2];
              } else if (extr.method === 'transferAll' && !extr.success) {
                // no event is emitted so we can't get amount
                transfer.amount = 0;
              } else if (extr.method === 'forceTransfer') {
                transfer.amount = JSON.parse(extr.params)[2];
              } else {
                transfer.amount = JSON.parse(extr.params)[1]; // 'transfer' and 'transferKeepAlive' methods
              }
              transfer.fee = !!feeInfo
              ? JSON.parse(feeInfo.toJSON().partialFee)
              : null;
            const createdTransfer = new Transfermodel(transfer);
            createdTransfer.save();
        }
        const createdExtrinsic = new Extmodel(extr);
        createdExtrinsic.save();

        //Guardem referencia extrinsic a block
        block.extrinsics.push(createdExtrinsic);
        //save created
     });

     const logs = extendedBlock.block.header.digest.logs;
     block.logs = [];
     logs.forEach((l,index)=> {
         log.blockNum = gap;
         log.logIndex = index;
         log.logType = l.type;
         //log.engine = ----
         //log.data = l.

         const createdLog = new Logsmodel(log);
         createdLog.save();

         block.logs.push(createdLog);

     });

     
     
     //Inserir logs
     const createdBlock = new Blockmodel(block);
     createdBlock.save();


     console.log(`Block ${gap} added`);
     //block.save();
     //const parentHash = header.parentHash
}

Run();
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

async function Run(){
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });


    const db = await mongoose.connect("mongodb://127.0.0.1:54755/explorerdb");
    mongoose.connection
        .once("open", () => console.log("Connected to Database"))
        .on("error", error => {
            console.log("Couldn't connect to MongoDb Database",error);
        });

    
    const chain = await api.rpc.system.chain();
    await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
        console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);


        //Guardar blocks en un gridfs

        if((await db.model('blocks',BlockSchema).find()).length == 0){
            await addBlocksDb(db,api,lastHeader.number.toNumber());
        }
        //prova
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

async function addBlocksDb(db,api: ApiPromise,gap) {
     //db.model('blocks', mongoose.Schema.)
     const Blockmodel =  db.model('blocks', BlockSchema);
     const Extmodel = db.model('extrinsics',ExtrinsicSchema);
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
     extrinsics.forEach((extrinsic,index) => {
        extr.section =  extrinsic.method.section;
        extr.blockTimestamp = timestamp;
        extr.method = extrinsic.method.method;
        extr.blockNum = gap;
        extr.extrinsicHash = extrinsic.hash.toHex();
        extr.extrinsicIndex = index;
        extr.params = JSON.stringify(extrinsic.method.args);

        if(extrinsic.isSigned){
            extr.nonce = extrinsic.nonce.toString();
            //const feeinfo = await api.rpc.payment.queryFeeDetails(extrinsic.toHex(),blockHash);
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
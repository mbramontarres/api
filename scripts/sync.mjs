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


    const db = await mongoose.connect(this.config.mongoDBConstring);
    mongoose.connection
        .once("open", () => console.log("Connected to Database"))
        .on("error", error => {
            console.log("Couldn't connect to MongoDb Database",error);
        });

    
    const chain = await api.rpc.system.chain();
    await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
        console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

        //Find block gaps in db
        const gaps = await db.model('blocks').aggregate([
            {$group : {_id : null, min : {$min : "$blockNum"}, max : {$max : "$lastHeader.number"}}},
            {$addFields : {rangeNums : {$range : ["$min", "$max"]}}},
            {$lookup : {from : "blocks", localField : "rangeIds", foreignField : "blockNum", as : "blocks"}},
            {$project : {_id :0, missingIds : {$setDifference : ["$rangeIds", "$blocks.blockNum"]}}}
        ]);
        
        gaps.forEach(async gap => {
            
            //db.model('blocks', mongoose.Schema.)
            const Blockmodel =  db.model('blocks', BlockSchema);
            const Extmodel = db.model('extrinsics',ExtrinsicSchema);
            const Eventmodel = db.model('events',EventSchema);
            const Logsmodel = db.model('logs',LogSchema);
            const extr = new ExtrinsicType;
            const event = new EventType;
            const block = new BlockType;
            const log = new LogType;
            
            const createdEvent = new Eventmodel(event);
            const createdExtrinsic = new Extmodel(extr);
            const createdLog = new Logsmodel(log);


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

            //const timestamp = gap !== 0? parseInt(block.extrinsics.find(({ method: { section, method } }) => section === 'timestamp' && method === 'set',).args[0].toString(),10,) : 0;
    

            block.blockHash = blockHash.toHex();
            block.blockNum = gap;
            block.parentHash = CurrentBlock.block.header.parentHash.toHex();
            block.extrinsicsRoot = CurrentBlock.block.header.extrinsicsRoot.toHex();
            block.stateRoot = CurrentBlock.block.header.stateRoot.toHex();
            block.blockAuthor = extendedBlock.author.toHex();
            block.eventCount = extendedBlock.events.length;
            block.extrinsicsCount = extendedBlock.block.extrinsics.length;
            block.finalized = false;
           // block.blockTimestamp = timestamp;
            const events = extendedBlock.events;
            /*events.forEach((e,index) => {
                //Falten parametres
                event.blockNum = gap;
                event.eventIndex = index;
                event.section = e.event.section;
                event.method = e.event.method;
                event.phase = e.phase;
                
            });*/

            const extrinsics = extendedBlock.block.extrinsics;
            //Afegir parametres que falten
            /*extrinsics.forEach((extrinsic,index) => {
               extr.section =  extrinsic.method.section;
               extr.method = extrinsic.method.method;
               extr.blockNum = gap;
               extr.extrinsicHash = extrinsic.hash.toHex();
               extr.extrinsicIndex = index;
               if(extrinsic.isSigned){
                   extr.nonce = extrinsic.nonce.toString();
               }
               //save created
            });*/

            const logs = extendedBlock.block.header.digest.logs;
            /*logs.forEach((l,index)=> {
                log.blockNum = gap;
                log.logIndex = index;
                log.logType = l.type;
                //log.engine = ----
                log.data = l.
            });*/

            
            
            //Inserir logs
            const createdBlock = new Blockmodel(block);
            createdBlock.save();
            //block.save();
            //const parentHash = header.parentHash

        })


    });

}

Run();
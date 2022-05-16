//@ts-check

import { ApiPromise, WsProvider } from "@polkadot/api";
import { encodeAddress } from '@polkadot/util-crypto';
import mongoose from "mongoose";
import { BlockType } from "../src/block/dto/block.dto";
import { BlockSchema } from "../src/block/block.schema";
import config from "../config/config";
import { BlockHash,BlockNumber } from '@polkadot/types/interfaces';

import { addOrReplaceAccount, processBlockData } from "./helpers/blockData";


async function Run(){
    //Connect to node
    const wsProvider = new WsProvider(config.wsProviderUrl);
    const api = await ApiPromise.create({ provider: wsProvider });

    //Db connection
    const db = await mongoose.connect(config.mongoDBConstring);
    mongoose.connection
        .once("open", () => console.log("Connected to Database"))
        .on("error", error => {
            console.log("Couldn't connect to MongoDb Database",error);
        }
    );

    //At least a block in the collection, otherwise findGaps doesn't work
    const buit = await db.model('blocks', BlockSchema).find()
    if(buit.length==0){
      console.log("Primer block");
      const last = await api.rpc.chain.getHeader();
      await addBlocksDb(db,api,last.number,true);
    }

    //Async main functionalities.
    Promise.all([ /*findGaps(db,api,null)*/,  processAllAccounts(api,db), listenBlocks(api,db)])
    

}

async function listenBlocks(api:ApiPromise,db: typeof mongoose){

  const chain = await api.rpc.system.chain();
  await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
    console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

    //process new Block
    await addBlocksDb(db,api,lastHeader.number.toNumber(),true);
    //Mirar finalitzats
    const finalizedHash = await api.rpc.chain.getFinalizedHead();
    await processFinalized(api,db,finalizedHash);
  });
}
async function processFinalized(api:ApiPromise,db,finalizedHash:BlockHash){
  const Blockmodel =  db.model('blocks', BlockSchema);
  const finalizedBlock =  await api.rpc.chain.getBlock(finalizedHash);
  const tofinalize = await Blockmodel.find({blockNum: {$lte:finalizedBlock.block.header.number.toNumber()},finalized: false});
  for(const f of tofinalize){
    
    const blockHash = await api.rpc.chain.getBlockHash(f.blockNum);
    const extendedBlock = await api.derive.chain.getHeader(blockHash);
    //console.log(extendedBlock);
    const parentHash = extendedBlock.parentHash;
    const extrinsicsRoot = extendedBlock.extrinsicsRoot;
    const blockAuthor = f.blockNum==0? '':extendedBlock.author.toString();
    const stateRoot = extendedBlock.stateRoot;
 
    await Blockmodel.updateOne({blockNum:f.blockNum},{blockHash:blockHash,blockAuthor:blockAuthor,extrinsicsRoot:extrinsicsRoot,parentHash:parentHash,stateRoot:stateRoot,finalized: true});
    
  }
  console.log("Últim Block finalitzat: "+finalizedBlock.block.header.number.toNumber());
}
async function processAllAccounts(api,db) {

  let limit = 50;
  let last_key = "";
  let query = await api.query.system.account.entriesPaged({ args: [], pageSize: limit, startKey: last_key });
  //console.log(query[limit-1]);
  while(query.length != 0){
    for(const account of query){
      let account_id = encodeAddress(account[0].slice(-32));
      await addOrReplaceAccount(api,account_id,db,false);
      last_key = account[0];
    }
    query = await api.query.system.account.entriesPaged({ args: [], pageSize: limit, startKey: last_key });
  }
  console.log("Accounts afegides");
}



async function findGaps(db: typeof mongoose,api: ApiPromise){
  console.log("Gaps Thread Started")
    const gaps =  await db.model('blocks', BlockSchema).aggregate([
        {$unset: ["_id","_v","blockTimestamp","blockHash","parentHash","stateRoot","extrinsicsRoot","extrinsics","events","logs","eventCount","extrinsicsCount","specVersion","blockAuthor","finalized"]},
        {
          "$unionWith": {"coll": "blocks","pipeline": [
              {$unset: ["_id","_v","blockTimestamp","blockHash","parentHash","stateRoot","extrinsicsRoot","extrinsics","events","logs","eventCount","extrinsicsCount","specVersion","blockAuthor","finalized"]},
              {$group: {_id: null,blockNum: {$min: -1}}},
              {$unset: ["_id"]}]
            }
        },
        {$lookup: {from: "blocks",let: {blockNum: "$blockNum"},pipeline: [
              {$match: {$expr: {$gt: ["$blockNum","$$blockNum"]}}},
              {$group: {_id: null,seguent: {$min: "$blockNum"}}}],
            as: "posteriors"
          }
        },
        {
          $unwind: "$posteriors"
        },
        {$set: {"left": {$sum: ["$blockNum",1]},"right": {$sum: ["$posteriors.seguent",-1]}}},
        {
          $unset: ["_id","__v","blockNum","posteriors"]
        },
        {
          $match: {$expr: {$gte: ["$right","$left"]}}
        },
        {$sort: {left: 1}}
      ])
      
    console.log(gaps);
    gaps.forEach(async gap => {
      let block = gap.left;
        while(block<=gap.right){
          await addBlocksDb(db,api,block,false);
          block++;
        }
        console.log("Gaps Thread Started:Gap afegit")
    });
}

async function addBlocksDb(db,api: ApiPromise,blockNum,updateAccount:boolean) {
    //db.model('blocks', mongoose.Schema.)
    const Blockmodel =  db.model('blocks', BlockSchema);
    const block = new BlockType;
    
    //parelitzar.....
    //Get Block Hash
    const blockHash = await api.rpc.chain.getBlockHash(blockNum);
    //Get block
    const CurrentBlock = await api.rpc.chain.getBlock(blockHash);
    //Extended block
    const extendedBlock = await api.derive.chain.getBlock(blockHash);
    //Get BlockApi
    const apiblock  = await api.at(blockHash);
    //get extended header for author.
    //const extendedHeader = await api.derive.chain.getHeader(blockHash);
    const runtime = await api.rpc.state.getRuntimeVersion(blockHash);
    const timestamp = blockNum !== 0? parseInt(extendedBlock.block.extrinsics.find(({ method: { section, method } }) => section === 'timestamp' && method === 'set',).args[0].toString(),10,) : 0;


    block.blockHash = blockHash.toHex();
    block.blockNum = blockNum;
    block.parentHash = CurrentBlock.block.header.parentHash.toHex();
    block.extrinsicsRoot = CurrentBlock.block.header.extrinsicsRoot.toHex();
    block.stateRoot = CurrentBlock.block.header.stateRoot.toHex();
    block.blockAuthor = extendedBlock.author? extendedBlock.author.toString():"";
    //treure counts
    block.eventCount = extendedBlock.events.length;
    block.extrinsicsCount = extendedBlock.block.extrinsics.length;
    block.specVersion = runtime.specVersion.toNumber();
    block.finalized = false;
    block.blockTimestamp = timestamp;
    
    //Processar contingut block
    const allevents = extendedBlock.events;
    let extrinsics = extendedBlock.block.extrinsics;
    block.extrinsics = [];
    block.events = [];
    //Afsegir parametres que falten
    await processBlockData(api,db,extrinsics,allevents,blockNum,blockHash,block,timestamp,updateAccount);    

    await Blockmodel.updateOne({blockNum: block.blockNum},{$setOnInsert:block},{upsert: true});
    
    console.log("Block: " + blockNum + " added")
    
}



Run();


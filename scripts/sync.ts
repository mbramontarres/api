//@ts-check

import { ApiPromise, WsProvider } from "@polkadot/api";
import { encodeAddress } from '@polkadot/util-crypto';
import mongoose from "mongoose";
import { BlockType } from "../src/block/dto/block.dto";
import { BlockSchema } from "../src/block/block.schema";
import config from "../config/config";
import { BlockHash,BlockNumber } from '@polkadot/types/interfaces';
import {searchGaps} from "./helpers/searchGaps"

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

    //Async main functionalities.
    Promise.all([ findGaps(db,api),  processAllAccounts(db,api), listenBlocks(db,api)])
    

}

async function listenBlocks(db,api:ApiPromise){

  console.log("Listener Thread Started")
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
    
    const parentHash = extendedBlock.parentHash;
    const extrinsicsRoot = extendedBlock.extrinsicsRoot;
    const blockAuthor = f.blockNum==0? '':extendedBlock.author.toString();
    const stateRoot = extendedBlock.stateRoot;

    await Blockmodel.updateOne({blockNum:f.blockNum},{blockHash:blockHash,blockAuthor:blockAuthor,extrinsicsRoot:extrinsicsRoot.toHex(),parentHash:parentHash.toHex(),stateRoot:stateRoot.toHex(),finalized: true});
  }
  console.log("Últim Block finalitzat: "+finalizedBlock.block.header.number.toNumber());
}
async function processAllAccounts(db,api) {

  
  console.log("Accounts Thread Started")
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



async function findGaps(db,api: ApiPromise){

  
  console.log("Gaps Thread Started")

    const lastHeader =  await api.rpc.chain.getHeader();
    const gaps = await searchGaps(lastHeader.number.toNumber(),db,BlockSchema);
    for(const gap of gaps){
      let block = gap.l;
      while(block<=gap.r){
        await addBlocksDb(db,api,block,false);
        block++;
      }
      console.log("Gaps Thread Started:Gap afegit")
    }

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
    block.extrinsicsCount = extendedBlock.extrinsics.length;
    block.eventCount = extendedBlock.events.length;
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


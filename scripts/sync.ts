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
import { AccountSchema } from "../src/account/account.schema";
import { AccountType } from "../src/account/dto/account.dto";
import { addLogs, addOrReplaceAccount, getAccountProperies, processBlockData } from "./helpers/blockData";

async function Run(){
    const wsProvider = new WsProvider(config.wsProviderUrl);
    const api = await ApiPromise.create({ provider: wsProvider });


    const db = await mongoose.connect(config.mongoDBConstring);
    mongoose.connection
        .once("open", () => console.log("Connected to Database"))
        .on("error", error => {
            console.log("Couldn't connect to MongoDb Database",error);
        }
    );
    //Almenys un block a la col·lecció
    const buit = await db.model('blocks', BlockSchema).find()
    if(buit.length==0){
      console.log("primer block");
      const last = await api.rpc.chain.getHeader();
      await addBlocksDb(db,api,last.number,true);
    }

    Promise.all([ findGaps(db,api,null),  processAllAccounts(api,db),  listenBlocks(api,db)])
    //findGaps(db,api,null);
    //await processAllAccounts(api);
    

}

async function listenBlocks(api,db){
  const chain = await api.rpc.system.chain();
  await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
      console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

     await addBlocksDb(db,api,lastHeader.number.toNumber(),true);

  });
}

async function processAllAccounts(api,db) {
  console.log("Thread Accounts Started")
  const accounts = await api.query.system.account.keys();
  let accountsIds = accounts.map(({ args }) => args).map(([e]) => e.toHuman());
  //parallize
  console.log("Thread Accounts: accounts trobades.")
  let result = []
  for (let i = 0; i < accountsIds.length; i += 20) {
    let chunk = accountsIds.slice(i, i + 20)
    result.push(chunk)
  }
  result.forEach( a=> {
    a.forEach(async account =>{
      await addOrReplaceAccount(api,account,db,false);
  })
    
  });
}

async function findGaps(db,api: ApiPromise, lastHeader){
  console.log("Gaps Thread Started")
    const gaps =  await db.model('blocks', BlockSchema).aggregate([
        {
          $unset: [
            "_id","_v","blockTimestamp","blockHash","parentHash","stateRoot","extrinsicsRoot","extrinsics","events","logs","eventCount","extrinsicsCount","specVersion","blockAuthor","finalized"
          ]
        },
        {
          "$unionWith": {
            "coll": "blocks",
            "pipeline": [
              {
                $unset: [
                    "_id","_v","blockTimestamp","blockHash","parentHash","stateRoot","extrinsicsRoot","extrinsics","events","logs","eventCount","extrinsicsCount","specVersion","blockAuthor","finalized"
                ]
              },
              {
                $group: {
                  _id: null,
                  blockNum: {
                    $min: -1
                  }
                }
              },
              {
                $unset: [
                  "_id"
                ]
              }
            ]
          }
        },
        {
          $lookup: {
            from: "blocks",
            let: {
              blockNum: "$blockNum"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $gt: [
                      "$blockNum",
                      "$$blockNum"
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  seguent: {
                    $min: "$blockNum"
                  }
                }
              }
            ],
            as: "posteriors"
          }
        },
        {
          $unwind: "$posteriors"
        },
        {
          $set: {
            "left": {
              $sum: [
                "$blockNum",
                1
              ]
            },
            "right": {
              $sum: [
                "$posteriors.seguent",
                -1
              ]
            }
          }
        },
        {
          $unset: [
           "_id",
           "__v",
            "blockNum",
            "posteriors"
          ]
        },
        {
          $match: {
            $expr: {
              $gte: [
                "$right",
                "$left"
              ]
            }
          }
        },
        {
          $sort: {
            left: 1
          }
        }
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
     const Extmodel = db.model('extrinsics',ExtrinsicSchema);
     const Transfermodel =  db.model('transfers', TransferSchema);
     const Eventmodel = db.model('events',EventSchema);
     const Logsmodel = db.model('logs',LogSchema);
     const extr = new ExtrinsicType;
     const event = new EventType;
     const block = new BlockType;
     const log = new LogType;
     
     

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
     const extendedHeader = await api.derive.chain.getHeader(blockHash);
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
     let extrinsics = await extendedBlock.block.extrinsics;
     block.extrinsics = [];
     block.events = [];
     //Afegir parametres que falten
    await processBlockData(api,db,extrinsics,allevents,blockNum,blockHash,block,timestamp,updateAccount);    

    await addLogs(Logsmodel,extendedBlock,block,blockNum);

     const createdBlock = new Blockmodel(block);
     block.extrinsics.map(e => console.log("fora:" +e.method));
     await Blockmodel.updateOne({blockNum: block.blockNum},block,{upsert: true});
     
     //createdBlock.save();


     console.log(`Block ${blockNum} added`);
}



Run();
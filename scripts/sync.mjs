//@ts-check

import  config  from '../config/config.js';

import  Setup  from './setup.js';

const setup = new Setup(config); 

//GetApi
const api = await  setup.getPolkadotAPI();

//GetMongodbconnection
//const db = await setup.getDB();



//console.log(api.genesisHash.toHex());
const chain = await api.rpc.system.chain();
await api.rpc.chain.subscribeNewHeads((lastHeader) => {
    console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
  });
//Cridar api?
//Find block gaps in db
/*const gaps = await db.model('blocks').aggregate([
    {$group : {_id : null, min : {$min : "$blockNum"}, max : {$max : "$blockNum"}}},
    {$addFields : {rangeNums : {$range : ["$min", "$max"]}}},
    {$lookup : {from : "blocks", localField : "rangeIds", foreignField : "blockNum", as : "blocks"}},
    {$project : {_id :0, missingIds : {$setDifference : ["$rangeIds", "$blocks.blockNum"]}}}
]);

gaps.forEach(gap => {

})*/


//Manage chain reorganizations






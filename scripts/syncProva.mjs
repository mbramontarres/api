// Import
import { ApiPromise, WsProvider } from '@polkadot/api';


// Construct
const wsProvider = new WsProvider('wss://rpc.polkadot.io');
const api = await ApiPromise.create({ provider: wsProvider });

// Do something
const chain = await api.rpc.system.chain();
await api.rpc.chain.subscribeNewHeads((lastHeader) => {
    console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

    //Cridar api!!!!!
    //Find block gaps in db
    const gaps = await db.model('blocks').aggregate([
        {$group : {_id : null, min : {$min : "$blockNum"}, max : {$max : "$lastHeader.number"}}},
        {$addFields : {rangeNums : {$range : ["$min", "$max"]}}},
        {$lookup : {from : "blocks", localField : "rangeIds", foreignField : "blockNum", as : "blocks"}},
        {$project : {_id :0, missingIds : {$setDifference : ["$rangeIds", "$blocks.blockNum"]}}}
    ]);
    
    gaps.forEach(gap => {
        

        //const block = await api.rpc.chain.getBlock
        //Get Block Hash
        const blockHash = await api.rpc.chain.getBlockHash(gap);
        
        //const parentHash = header.parentHash

    })


});
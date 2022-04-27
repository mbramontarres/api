//@ts-check
// Import
import { ApiPromise, WsProvider } from '@polkadot/api';


import {BlockType} from '../src/block/dto/block.dto'
import {ExtrinsicType} from '../src/extrinsic/extrinsic.dto'

// Construct
const wsProvider = new WsProvider('wss://rpc.polkadot.io');
const api = await ApiPromise.create({ provider: wsProvider });

await module.exports.processBlocks(api);
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
        const [
            blockHeader,
            runtimeVersion,
            timestampMs,
            validatorCount,
            ChainCurrentIndex,
            ChainCurrentSlot,
            ChainEpochIndex,
            ChainGenesisSlot,
            ChainCurrentEra,
            eraElectionStatus,
            totalIssuance
          ] = await Promise.all([
            api.derive.chain.getHeader(blockHash),
            api.rpc.state.getRuntimeVersion(blockHash),
            api.query.timestamp.now.at(blockHash),
            api.query.staking.validatorCount.at(blockHash),
            api.query.session.currentIndex.at(blockHash),
            api.query.babe.currentSlot.at(blockHash),
            api.query.babe.epochIndex.at(blockHash),
            api.query.babe.genesisSlot.at(blockHash),
            api.query.staking.currentEra.at(blockHash),
            api.query.staking.eraElectionStatus.at(blockHash),
            api.query.balances.totalIssuance.at(blockHash)
        ]);

        const block = new BlockType;
        const apiblock  = await api.at(blockHash);
        /*let events = [];       
        events = await apiblock.query.system.events;
        events.forEach( event =>{
            //block.events.push(evet)
            
        });*/
        
        const CurrentBlock = await api.rpc.chain.getBlock(blockHash);
        let extrinsics = [];
        extrinsics = CurrentBlock.block.extrinsics;
        extrinsics.forEach( extr => {
            const extrinsic = new ExtrinsicType;
            extrinsic.blockNum = gap;
            extrinsic.extrinsicHash = extr.hash.toHex();
            extrinsic.signature = extr.signature.toHex();
            //...
            //Inserir
            //block.extrinsics.push();
        });

        const extendedHeader = await api.derive.chain.getHeader(blockHash);

        block.blockHash = blockHash.toHex();
        block.blockNum = gap;
        block.parentHash = CurrentBlock.block.header.parentHash.toHex();
        block.extrinsicsRoot = CurrentBlock.block.header.extrinsicsRoot.toHex();
        block.stateRoot = CurrentBlock.block.header.stateRoot.toHex();
        block.blockAuthor = extendedHeader.author.toHex();
        //Inserir logs

        //const parentHash = header.parentHash

    })


});

async


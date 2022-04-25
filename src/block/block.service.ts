import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Block, BlockDocument } from './block.schema';
import { BlockArgs } from './dto/block.args';
import { BlockType } from './dto/block.dto';
import { BlockModule } from './block.module';


@Injectable()
export class BlockService {
    constructor(@InjectModel(Block.name) private blockModel: Model<BlockDocument>) {}

    public async findAll(blockArgs: BlockArgs): Promise<Block[]> 
    {
        //const { limit, offset } = blockArgs;
        return this.blockModel.find({skip: blockArgs.skip, take: blockArgs.take});
    }

    /*public async findGaps(): Promise<Number[]>
    {
        return this.blockModel.aggregate([
            {$group : {_id : null, min : {$min : "$blockNum"}, max : {$max : "$blockNum"}}},
            {$addFields : {rangeNums : {$range : ["$min", "$max"]}}},
            {$lookup : {from : "blocks", localField : "rangeIds", foreignField : "blockNum", as : "blocks"}},
            {$project : {_id :0, missingIds : {$setDifference : ["$rangeIds", "$blocks.blockNum"]}}}
        ]);
    }*/

    async create(createBlockDto: BlockType): Promise<Block> {
        const createdBlock = new this.blockModel(createBlockDto);
        return createdBlock.save();
    }

    async update(id: string, updateBlockDto: BlockType): Promise<Block> {
        return this.blockModel.findByIdAndUpdate(id, updateBlockDto);
    }
    
    async delete(id: string): Promise<Block> {
        return this.blockModel.findByIdAndDelete(id);
    }

}
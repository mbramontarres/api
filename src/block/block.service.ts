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
        return this.blockModel.find().sort({blockNum: -1}).skip(blockArgs.skip).limit(blockArgs.take).exec();
    }

    public async findOne(num: Number): Promise<Block> 
    {
        return this.blockModel.findOne({blockNum: num})
                    .populate('extrinsics')
                    .populate('events').exec();
    }


    public async count(): Promise<Number> 
    {
        return this.blockModel.count().exec();
    }

}
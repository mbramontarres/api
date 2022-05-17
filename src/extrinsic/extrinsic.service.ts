import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Extrinsic, ExtrinsicDocument } from './extrinsic.schema';
import { ExtrinsicType } from './dto/extrinsic.dto';
import { ExtrinsicArgs } from './dto/extrinsic.args';

@Injectable()
export class ExtrinsicService {
    constructor(@InjectModel(Extrinsic.name) private extrinsicModel: Model<ExtrinsicDocument>) {}


    public async findAll(extrinsicArgs: ExtrinsicArgs): Promise<Extrinsic[]> 
    {
        //const { limit, offset } = blockArgs;

        return this.extrinsicModel.find().sort({blockNum: -1}).skip(extrinsicArgs.skip).limit(extrinsicArgs.take).exec();
    }

    public async findOne(blockNum: Number,index:Number): Promise<Extrinsic> 
    {
        //const { limit, offset } = blockArgs;
        return this.extrinsicModel.findOne({blockNum: blockNum,extrinsicIndex: index})
                    .populate('events').exec();
    }

    public async count(): Promise<Number> 
    {
        //const { limit, offset } = blockArgs;
        return this.extrinsicModel.count().exec();
    }
}
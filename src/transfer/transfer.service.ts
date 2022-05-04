import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TransferArgs } from './dto/transfer.args';
import { Transfer, TransferDocument } from './transfer.schema';

@Injectable()
export class TransferService {
    constructor(@InjectModel(Transfer.name) private transferModel: Model<TransferDocument>) {}

    public async findAll(transferArgs: TransferArgs): Promise<Transfer[]> 
    {

        return this.transferModel.find().sort({blockNum: -1}).skip(transferArgs.skip).limit(transferArgs.take).exec();
    }

    public async findOne(hash: String): Promise<Transfer[]> 
    {
        //const { limit, offset } = blockArgs;
        return this.transferModel.find({hash: hash})
                    .populate('events').exec();
    }
}
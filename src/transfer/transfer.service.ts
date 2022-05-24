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

    public async findAccountTransfers(accountId:String, transferArgs: TransferArgs): Promise<Transfer[]> 
    {

        return this.transferModel.find({ $or: [ { source: accountId   }, { destination: accountId } ] }).sort({blockNum: -1}).skip(transferArgs.skip).limit(transferArgs.take).exec();
    }

    public async findOne(hash: String): Promise<Transfer> 
    {
        //const { limit, offset } = blockArgs;
        return this.transferModel.findOne({hash: hash})
                    .populate('events').exec();
    }

    public async count(): Promise<Number> 
    {
        //const { limit, offset } = blockArgs;
        return this.transferModel.count().exec();
    }

    public async transferHistory(): Promise<any[]> 
    {
        //const { limit, offset } = blockArgs;
        return this.transferModel.aggregate([
            {
                $group:{
                    _id:{ $dateToString: { format: "%Y-%m-%d", date: {$toDate:"$blockTimestamp"}} },
                    total: {$sum: 1}
                },
                
            },
            {
                $sort:{
                    _id: 1
                }
            }
            
        ])
        .exec();
    }
}

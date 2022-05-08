import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './account.schema';
import { AccountArgs } from './dto/account.args';
import { Model } from 'mongoose';

@Injectable()
export class AccountService {
    constructor(@InjectModel(Account.name) private blockModel: Model<AccountDocument>) {}

    public async findAll(accountArgs: AccountArgs): Promise<Account[]> 
    {
        //const { limit, offset } = blockArgs;

        return this.blockModel.find().sort({blockNum: -1}).skip(accountArgs.skip).limit(accountArgs.take).exec();
    }

    public async findOne(id: String): Promise<Account> 
    {
        //const { limit, offset } = blockArgs;
        return this.blockModel.findOne({accountId: id})
                    .populate('transfers').exec();
    }
}

import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountResolver } from './account.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { TransferModule } from '../transfer/transfer.module';
import { Account, AccountSchema } from './account.schema';

@Module({
  providers: [AccountService, AccountResolver],
  imports: [TransferModule, MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])]
})
export class AccountModule {}
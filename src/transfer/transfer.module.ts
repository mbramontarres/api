import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../event/event.module';
import { TransferResolver } from './transfer.resolver';
import { Transfer, TransferSchema } from './transfer.schema';
import { TransferService } from './transfer.service';

@Module({
  providers: [TransferResolver, TransferService],
  imports: [EventModule, MongooseModule.forFeature([{ name: Transfer.name, schema: TransferSchema }])]
})
export class TransferModule {}

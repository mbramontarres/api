import { Module } from '@nestjs/common';
import { BlockResolver } from './block.resolver';
import { BlockService } from './block.service';

import { ExtrinsicModule } from '../extrinsic/extrinsic.module';
import { EventModule } from '../event/event.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './block.schema';

@Module({
  providers: [BlockResolver, BlockService],
  imports: [ExtrinsicModule,EventModule, MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }])]
})
export class BlockModule {}

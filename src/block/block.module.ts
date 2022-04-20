import { Module } from '@nestjs/common';
import { BlockResolver } from './block.resolver';
import { BlockService } from './block.service';

import { ExtrinsicModule } from 'src/extrinsic/extrinsic.module';

@Module({
  providers: [BlockResolver, BlockService],
  imports: [ExtrinsicModule]
})
export class BlockModule {}

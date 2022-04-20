import { Module } from '@nestjs/common';
import { ExtrinsicService } from './extrinsic.service';
import { ExtrinsicResolver } from './extrinsic.resolver';

@Module({
  providers: [ExtrinsicService, ExtrinsicResolver]
})
export class ExtrinsicModule {}

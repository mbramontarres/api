import { Module } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainResolver } from './chain.resolver';

@Module({
  providers: [ChainService, ChainResolver]
})
export class ChainModule {}

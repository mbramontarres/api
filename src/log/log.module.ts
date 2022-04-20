import { Module } from '@nestjs/common';
import { LogResolver } from './log.resolver';
import { LogService } from './log.service';

@Module({
  providers: [LogResolver, LogService]
})
export class LogModule {}

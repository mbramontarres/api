import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogResolver } from './log.resolver';
import { Log, LogSchema } from './log.schema';
import { LogService } from './log.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [LogResolver, LogService]
})
export class LogModule {}

import { Module } from '@nestjs/common';
import { ExtrinsicService } from './extrinsic.service';
import { ExtrinsicResolver } from './extrinsic.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Extrinsic, ExtrinsicSchema } from './extrinsic.schema';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule, MongooseModule.forFeature([{ name: Extrinsic.name, schema: ExtrinsicSchema }])],
  providers: [ExtrinsicService, ExtrinsicResolver]
})
export class ExtrinsicModule {}

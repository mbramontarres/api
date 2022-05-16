import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockModule } from './block/block.module';
import { ExtrinsicModule } from './extrinsic/extrinsic.module';
import { EventModule } from './event/event.module';
import { TransferModule } from './transfer/transfer.module';
import { AccountModule } from './account/account.module';
import config from "../config/config";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    MongooseModule.forRoot(config.mongoDBConstring/*'mongodb://localhost/explorerdb'*/),
    BlockModule,
    ExtrinsicModule,
    EventModule,
    TransferModule,
    AccountModule
  ],
})
export class AppModule {}
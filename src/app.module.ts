import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatModule } from './cat/cat.module';
import { ChainModule } from './chain/chain.module';
import { BlockModule } from './block/block.module';
import { ExtrinsicModule } from './extrinsic/extrinsic.module';
import { EventModule } from './event/event.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    CatModule,
    MongooseModule.forRoot('mongodb://localhost/nest'),
    ChainModule,
    BlockModule,
    ExtrinsicModule,
    EventModule,
    LogModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
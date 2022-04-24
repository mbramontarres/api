import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { Extrinsic } from 'src/extrinsic/extrinsic.schema';
import { Event } from 'src/event/event.schema';
import { Log } from 'src/log/log.schema';
import { ExtrinsicType } from 'src/extrinsic/extrinsic.dto';
import { LogType } from 'src/log/log.dto';
import { EventType } from 'src/event/event.dto';

@Schema()
@ObjectType()
export class Block {

    @Field(()=> Int)
    @Prop()
    blockNum: number;

    @Field(()=> Number)
    @Prop()
    blockTimestamp: number;

    @Field(()=> String)
    @Prop()
    blockHash: string;

    @Field(()=> String)
    @Prop()
    parentHash: string;

    @Field(()=> String)
    @Prop()
    stateRoot: string;

    @Field(()=> String)
    @Prop()
    extrinsicsRoot: string;

    @Field(() => [ExtrinsicType])
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Extrinsic' }] })
    extrinsics: Extrinsic[];

    @Field(() => [EventType])
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
    events: Event[];

    @Field(() => [LogType])
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }] })
    logs: Log[];


    @Field(()=> Int)
    @Prop()
    eventCount: number;

    @Field(()=> Int)
    @Prop()
    extrinsicsCount: number;

    @Field(()=> Number)
    @Prop()
    specVersion: number;

    @Field(()=> String)
    @Prop()
    blockAuthor: string;

    @Field(()=> Boolean)
    @Prop()
    finalized: boolean;

}

export type BlockDocument = Block & Document;
export const BlockSchema = SchemaFactory.createForClass(Block);
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { Event } from 'src/event/event.schema';
import { EventType } from 'src/event/event.dto';


@Schema()
@ObjectType()
export class Extrinsic {

    @Field(() => Int)
    @Prop()
    blockNum: number;

    @Field(() => Number)
    @Prop()
    blockTimestamp: number;

    @Field(() => String)
    @Prop()
    extrinsicIndex: string;

    @Field(() => String)
    @Prop()
    callModulefunction: string;

    @Field(() => String)
    @Prop()
    callModule: string;

    @Field(() => String)
    @Prop()
    accountId: string;

    @Field(() => String)
    @Prop()
    signature: string;

    @Field(() => String)
    @Prop()
    nonce: string;

    @Field(() => String)
    @Prop()
    extrinsicHash: string;

    @Field(() => Boolean)
    @Prop()
    succes: boolean;

    @Field(() => [EventType])
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
    events: Event[];

    @Field(() => String)
    @Prop()
    params: string;

    @Field(() => Number)
    @Prop()
    fee: number;

    @Field(() => Boolean)
    @Prop()
    finalized: boolean;
}

export type ExtrinsicDocument = Extrinsic & Document;
export const ExtrinsicSchema = SchemaFactory.createForClass(Extrinsic);
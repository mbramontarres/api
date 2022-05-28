import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { Event } from '../event/event.schema';
import { EventType } from '../event/dto/event.dto';


@Schema()
@ObjectType()
export class Extrinsic {

    @Field(() => Int)
    @Prop()
    blockNum: number;

    @Field(() => Number)
    @Prop()
    blockTimestamp: number;

    @Field(() => Int)
    @Prop()
    extrinsicIndex: number;

    @Field(() => String)
    @Prop()
    section: string;

    @Field(() => String)
    @Prop()
    method: string;

    @Field(() => String)
    @Prop()
    extrinsicHash: string;

    @Field(() => Boolean)
    @Prop()
    success: boolean;

    @Field(() => [EventType])
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
    events: Event[];

    @Field(() => String)
    @Prop()
    params: string;

    @Field(()=> String)
    @Prop()
    doc: string;
    
    @Field(() => Boolean)
    @Prop()
    finalized: boolean;
}

export type ExtrinsicDocument = Extrinsic & Document;
export const ExtrinsicSchema = SchemaFactory.createForClass(Extrinsic);
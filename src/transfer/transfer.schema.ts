import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { Event } from '../event/event.schema';
import { EventType } from '../event/dto/event.dto';


@Schema()
@ObjectType()
export class Transfer {

    @Field(() => Int)
    @Prop()
    blockNum: number;

    @Field(() => Int)
    @Prop()
    extrinsicIndex: number;

    @Field(() => String)
    @Prop()
    section: string;

    @Field(() => String)
    @Prop()
    method: string;

    @Field(() => Number)
    @Prop()
    blockTimestamp: number;

    @Field(() => String)
    @Prop()
    hash: string;

    @Field(() => String, { nullable: true })
    @Prop()
    source: string;
    
    @Field(() => String)
    @Prop()
    destination: string;

    @Field(() => Number)
    @Prop()
    amount: number;

    @Field(() => Number, { nullable: true })
    @Prop()
    fee: number;

    @Field(() => Boolean)
    @Prop()
    success: boolean;
    

    @Field(() => [EventType])
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
    events: Event[];
    
}

export type TransferDocument = Transfer & Document;
export const TransferSchema = SchemaFactory.createForClass(Transfer);
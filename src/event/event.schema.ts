import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
@ObjectType()
export class Event {

    @Field(()=> Int)
    @Prop()
    eventIndex: Number;

    @Field(()=> Int)
    @Prop()
    blockNum: number;

    @Field(()=> Number)
    @Prop()
    blockTimestamp: number;

    @Field(()=> Int)
    @Prop()
    extrinsicIndex: number;

    @Field(()=> String)
    @Prop()
    method: string;

    @Field(()=> String)
    @Prop()
    section: string;

    @Field(()=> String)
    @Prop()
    phase: string;

    @Field(()=> String)
    @Prop()
    doc: string;

    @Field(()=> String)
    @Prop()
    data: string;

    @Field(()=> String)
    @Prop()
    extrinsicHash: string;
    
}

export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);
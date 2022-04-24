import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
@ObjectType()
export class Event {

    @Field(()=> String)
    @Prop()
    eventIndex: string;

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
    moduleId: string;

    @Field(()=> String)
    @Prop()
    eventId: string;
    
    @Field(()=> String)
    @Prop()
    params: string;

    @Field(()=> Number)
    @Prop()
    eventIdx: number;

    @Field(()=> String)
    @Prop()
    extrinsicHash: string;
    
}

export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);
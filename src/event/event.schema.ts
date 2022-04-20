import { Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event {
    @Prop()
    eventIndex: string;

    @Prop({type: Int})
    blockNum: number;

    @Prop({type: Int})
    blockTimestamp: number;

    @Prop({type: Int})
    extrinsicIndex: number;

    @Prop()
    moduleId: string;

    @Prop()
    eventId: string;
    
    @Prop()
    params: string;

    @Prop({type: Int})
    eventIdx: number;

    @Prop()
    extrinsicHash: string;
    
}

export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);
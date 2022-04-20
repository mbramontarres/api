import { Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Log {
    @Prop()
    logIndex: string;

    @Prop({type: Int})
    blockNum: number;

    @Prop()
    logType: string;

    @Prop()
    originType: string;

    @Prop()
    data: string;
    
}

export type LogDocument = Log & Document;
export const LogSchema = SchemaFactory.createForClass(Log);
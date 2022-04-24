import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
@ObjectType()
export class Log {

    @Field(() => String)
    @Prop()
    logIndex: string;

    @Field(() => Int)
    @Prop()
    blockNum: number;

    @Field(() => String)
    @Prop()
    logType: string;

    @Field(() => String)
    @Prop()
    originType: string;

    @Field(() => String)
    @Prop()
    data: string;
    
}

export type LogDocument = Log & Document;
export const LogSchema = SchemaFactory.createForClass(Log);
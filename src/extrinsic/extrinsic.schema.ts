import { Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { Event } from 'src/event/event.schema';


/*class Characteristics {
    lifespan: string
    size: 'small' | 'medium' | 'large'
    coat: 'short' | 'medium' | 'long'
    color: string
}*/

@Schema()
export class Extrinsic {

    @Prop({type: Int})
    blockNum: number;

    @Prop({type: Int})
    blockTimestamp: number;

    @Prop()
    extrinsicIndex: string;

    @Prop()
    callModulefunction: string;

    @Prop()
    callModule: string;

    @Prop()
    accountId: string;

    @Prop()
    signature: string;

    @Prop()
    nonce: string;

    @Prop()
    extrinsicHash: string;

    @Prop()
    succes: boolean;


    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
    events: Event[];

    @Prop()
    params: string;

    @Prop()
    fee: number;

    @Prop()
    finalized: boolean;
}

export type ExtrinsicDocument = Extrinsic & Document;
export const ExtrinsicSchema = SchemaFactory.createForClass(Extrinsic);
import { Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { Extrinsic } from 'src/extrinsic/extrinsic.schema';
import { Event } from 'src/event/event.schema';
import { Log } from 'src/log/log.schema';


/*class Characteristics {
    lifespan: string
    size: 'small' | 'medium' | 'large'
    coat: 'short' | 'medium' | 'long'
    color: string
}*/

@Schema()
export class Block {

    @Prop({type: Int})
    blockNum: number;

    @Prop({type: Int})
    blockTimestamp: number;

    @Prop()
    blockHash: string;

    @Prop()
    parentHash: string;

    @Prop()
    stateRoot: string;

    @Prop()
    extrinsicsRoot: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Extrinsic' }] })
    extrinsics: Extrinsic[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
    events: Event[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }] })
    logs: Log[];

    //Falten events i logs
    @Prop({type: Int})
    eventCount: number;

    @Prop({type: Int})
    extrinsicsCount: number;

    @Prop({type: Int})
    specVersion: number;

    @Prop()
    blockAuthor: string;

    @Prop()
    finalized: boolean;

}

export type BlockDocument = Block & Document;
export const BlockSchema = SchemaFactory.createForClass(Block);
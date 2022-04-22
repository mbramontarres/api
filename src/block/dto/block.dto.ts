import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";
import { type } from 'os';
import { Extrinsic } from "src/extrinsic/extrinsic.schema";
import { Log } from "src/log/log.schema";
import { Event } from "src/event/event.schema";
import mongoose from "mongoose";


@ObjectType('BlockType')
@InputType('BlockInputType')
export class BlockType {

    @Field(() => Int)
    blockNum: number;

    @Field(() => Int)
    blockTimestamp: number;

    @Field()
    blockHash: string;

    @Field()
    parentHash: string;

    @Field()
    stateRoot: string;

    @Field()
    extrinsicsRoot: string;

    @Field(type => [{ type: mongoose.Schema.Types.ObjectId, ref: 'Extrinsic' }])
    extrinsics: Extrinsic[];

    @Field(type => [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }])
    events: Event[];

    @Field(type => [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }])
    logs: Log[];

    @Field(() => Int)
    eventCount: number;

    @Field(() => Int)
    extrinsicsCount: number;

    @Field(() => Int)
    specVersion: number;

    @Field()
    blockAuthor: string;

    @Field()
    finalized: boolean;
}
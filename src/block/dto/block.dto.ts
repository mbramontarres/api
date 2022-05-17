import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";
import { type } from 'os';
import { Extrinsic } from "src/extrinsic/extrinsic.schema";
import { Event } from "src/event/event.schema";
import mongoose from "mongoose";
import { ExtrinsicType } from "../../extrinsic/dto/extrinsic.dto";
import { EventType } from "../../event/dto/event.dto";



@ObjectType('BlockType')
@InputType('BlockInputType')
export class BlockType {

    @Field(() => Int)
    blockNum: number;

    @Field(() => Number)
    blockTimestamp: number;

    @Field()
    blockHash: string;

    @Field()
    parentHash: string;

    @Field()
    stateRoot: string;

    @Field()
    extrinsicsRoot: string;

    @Field(() => [ExtrinsicType])
    extrinsics: ExtrinsicType[];

    @Field(() => [EventType])
    events: EventType[];

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
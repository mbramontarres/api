import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";
import mongoose from "mongoose";
import { EventType } from "../../event/dto/event.dto";


import { Event } from 'src/event/event.schema';

@ObjectType('ExtrinsicType')
@InputType('ExtrinsicInputType')
export class ExtrinsicType {
    @Field(() => Int)
    blockNum: number;

    @Field(() => Number)
    blockTimestamp: number;

    @Field(() => Int)
    extrinsicIndex: number;

    @Field()
    section: string;

    @Field()
    method: string;

    @Field()
    extrinsicHash: string;

    @Field()
    success: boolean;

    @Field(() => [EventType])
    events: EventType[];

    @Field()
    params: string;

    @Field()
    doc: string;

    @Field()
    finalized: boolean;
}
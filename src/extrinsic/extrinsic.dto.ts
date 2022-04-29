import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";
import mongoose from "mongoose";
import { EventType } from "../event/event.dto";


import { Event } from 'src/event/event.schema';

@ObjectType('ExtrinsicType')
@InputType('ExtrinsicInputType')
export class ExtrinsicType {
    @Field(() => Int)
    blockNum: number;

    @Field(() => Int)
    blockTimestamp: number;

    @Field(() => Int)
    extrinsicIndex: number;

    @Field()
    section: string;

    @Field()
    method: string;

    @Field()
    accountId: string;

    @Field()
    signature: string;

    @Field()
    nonce: string;

    @Field()
    extrinsicHash: string;

    @Field()
    success: boolean;

    @Field(() => [EventType])
    events: EventType[];

    @Field()
    params: string;

    @Field()
    fee: number;

    @Field()
    finalized: boolean;
}
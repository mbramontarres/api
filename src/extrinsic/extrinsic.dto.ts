import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";
import mongoose from "mongoose";

@ObjectType('ExtrinsicType')
@InputType('ExtrinsicInputType')
export class ExtrinsicType {
    @Field(() => Int)
    blockNum: number;

    @Field(() => Int)
    blockTimestamp: number;

    @Field()
    extrinsicIndex: string;

    @Field()
    callModulefunction: string;

    @Field()
    callModule: string;

    @Field()
    accountId: string;

    @Field()
    signature: string;

    @Field()
    nonce: string;

    @Field()
    extrinsicHash: string;

    @Field()
    succes: boolean;

    @Field(type => [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }])
    events: Event[];

    @Field()
    params: string;

    @Field()
    fee: number;

    @Field()
    finalized: boolean;
}
import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";

@ObjectType('EventType')
@InputType('EventInputType')
export class EventType {
    @Field(() => Int)
    eventIndex: number;

    @Field(() => Int)
    blockNum: number;

    @Field(() => Number)
    blockTimestamp: number;

    @Field(() => Int)
    extrinsicIndex: number;

    @Field()
    method: string;

    @Field()
    section: string;

    @Field()
    phase: string;

    @Field()
    doc: string;

    @Field()
    data: string;

    @Field()
    extrinsicHash: string;
}
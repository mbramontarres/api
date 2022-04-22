import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";

@ObjectType('EventType')
@InputType('EventInputType')
export class EventType {
    @Field()
    eventIndex: string;

    @Field(() => Int)
    blockNum: number;

    @Field(() => Int)
    blockTimestamp: number;

    @Field(() => Int)
    extrinsicIndex: number;

    @Field()
    moduleId: string;

    @Field()
    eventId: string;
    
    @Field()
    params: string;

    @Field(() => Int)
    eventIdx: number;

    @Field()
    extrinsicHash: string;
}
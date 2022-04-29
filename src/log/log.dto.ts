import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";

@ObjectType('LogType')
@InputType('LogInputType')
export class LogType {
    @Field(() => Int)
    logIndex: number;

    @Field(() => Int)
    blockNum: number;

    @Field()
    logType: string;

    @Field()
    originType: string;

    @Field()
    data: string;
}
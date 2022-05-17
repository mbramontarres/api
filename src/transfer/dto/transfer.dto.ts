import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { EventType } from "../../event/dto/event.dto";

@ObjectType('TransferType')
@InputType('TransferInputType')
export class TransferType {

    @Field(() => Int)
    blockNum: number;

    @Field(() => Int)
    extrinsicIndex: number;

    @Field(() => String)
    section: string;

    @Field(() => String)
    method: string;

    @Field(() => Number)
    blockTimestamp: number;

    @Field(() => String)
    hash: string;

    @Field(() => String)

    source: string;
    
    @Field(() => String)
    destination: string;

    @Field(() => Number)
    amount: number;

    @Field(() => Number, { nullable: true })
    fee: number;

    @Field(() => Boolean)
    success: boolean;
    
    @Field(() => [EventType])
    events: EventType[];



}
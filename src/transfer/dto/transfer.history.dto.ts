import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@ObjectType('transferHistory')

export class transferHistory {

    @Field(() => Int)
    total: number;

    @Field(() => String)
    _id: string;

}
import { ObjectType, Field, InputType, Int } from "@nestjs/graphql";

import { TransferType } from "../../transfer/dto/transfer.dto";


@ObjectType('AccountType')
@InputType('AccountInputType')
export class AccountType {

    @Field(()=> String)
    accountId: string;

    @Field(()=> Number)
    nonce: number;

    @Field(()=> String)
    availableBalance: string;

    @Field(()=> String)
    freeBalance: string;

    @Field(()=> String)
    lockedBalance: string;

    @Field(()=> String)
    reservedBalance: string;

    @Field(()=> String)
    totalBalance: string;

}
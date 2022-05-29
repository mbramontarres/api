import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type } from 'os';
import * as mongoose from 'mongoose';

import { TransferType } from '../transfer/dto/transfer.dto';
import { Transfer } from '../transfer/transfer.schema';

@Schema()
@ObjectType()
export class Account {

    @Field(()=> String)
    @Prop()
    accountId: string;

    @Field(()=> Number)
    @Prop()
    nonce: number;

    @Field(()=> String)
    @Prop()
    availableBalance: string;

    @Field(()=> String)
    @Prop()
    freeBalance: string;

    @Field(()=> String)
    @Prop()
    lockedBalance: string;

    @Field(()=> String)
    @Prop()
    reservedBalance: string;

    @Field(()=> String)
    @Prop()
    totalBalance: string;
}

export type AccountDocument = Account & Document;
export const AccountSchema = SchemaFactory.createForClass(Account);
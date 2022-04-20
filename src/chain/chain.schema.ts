import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/*class Characteristics {
    lifespan: string
    size: 'small' | 'medium' | 'large'
    coat: 'short' | 'medium' | 'long'
    color: string
}*/

@Schema()
export class Chain {
    @Prop()
    block_height: string;
    

}

export type ChainDocument = Chain & Document;
export const ChainSchema = SchemaFactory.createForClass(Chain);
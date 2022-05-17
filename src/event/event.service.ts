import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './event.schema';
import { EventType } from './dto/event.dto';
import { EventArgs } from './dto/event.args';

@Injectable()
export class EventService {
    constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

    public async findAll(eventArgs: EventArgs): Promise<Event[]> 
    {
        return this.eventModel.find().sort({blockNum: -1}).skip(eventArgs.skip).limit(eventArgs.take).exec();
    }

    public async findOne(blockNum: Number,index:Number): Promise<Event> 
    {
        //const { limit, offset } = blockArgs;
        return this.eventModel.findOne({blockNum: blockNum,eventIndex: index}).exec();
    }

    public async count(): Promise<Number> 
    {
        //const { limit, offset } = blockArgs;
        return this.eventModel.count().exec();
    }
}
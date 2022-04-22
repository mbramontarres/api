import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './event.schema';
import { EventType } from './event.dto';

@Injectable()
export class EventService {
    constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

    async findAll(): Promise<Event[]> {
        return this.eventModel.find().exec();
    }

    async create(createEventDto: EventType): Promise<Event> {
        const createdEvent = new this.eventModel(createEventDto);
        return createdEvent.save();
    }

    async update(id: string, updateEventDto: EventType): Promise<Event> {
        return this.eventModel.findByIdAndUpdate(id, updateEventDto);
    }
    
    async delete(id: string): Promise<Event> {
        return this.eventModel.findByIdAndDelete(id);
    }
}
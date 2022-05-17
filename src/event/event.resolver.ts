import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EventService } from './event.service';
import { EventType } from './dto/event.dto';
import { EventArgs } from './dto/event.args';

@Resolver()
export class EventResolver {
    constructor(private readonly eventService: EventService) {}

    @Query(returns => [EventType])
    async events(@Args() eventArgs: EventArgs) {
        return this.eventService.findAll(eventArgs);
    }

    @Query(returns => EventType, { nullable: true })
    async event(@Args('blockNum') blockNum: Number,@Args('eventIndex') eventIndex: Number) {
        return this.eventService.findOne(blockNum,eventIndex);
    }

    @Query(returns => Int)
    async eventsCount() {
        return this.eventService.count();
    }
}
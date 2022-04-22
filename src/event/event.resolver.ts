import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EventService } from './event.service';
import { EventType } from './event.dto';

@Resolver()
export class EventResolver {
    constructor(private readonly eventService: EventService) {}

    @Query(returns => [EventType])
    async events() {
        return this.eventService.findAll();
    }

    @Mutation(returns => EventType)
    async createEvent(@Args('input') input: EventType) {
        return this.eventService.create(input);
    }

    @Mutation(returns => EventType)
    async updateEvent(@Args('id') id: string, @Args('input') input: EventType) {
        return this.eventService.update(id, input);
    }

    @Mutation(returns => EventType)
    async deleteEvent(@Args('id') id: string) {
        return this.eventService.delete(id);
    }
}
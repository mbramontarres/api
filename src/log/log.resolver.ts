import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { LogService } from './log.service';
import { LogType } from './log.dto';

@Resolver()
export class LogResolver {
    constructor(private readonly logService: LogService) {}

    @Query(returns => [LogType])
    async logs() {
        return this.logService.findAll();
    }

    @Mutation(returns => LogType)
    async createLog(@Args('input') input: LogType) {
        return this.logService.create(input);
    }

    @Mutation(returns => LogType)
    async updateLog(@Args('id') id: string, @Args('input') input: LogType) {
        return this.logService.update(id, input);
    }

    @Mutation(returns => LogType)
    async deleteLog(@Args('id') id: string) {
        return this.logService.delete(id);
    }
}
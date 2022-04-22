import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ExtrinsicService } from './extrinsic.service';
import { ExtrinsicType } from './extrinsic.dto';

@Resolver()
export class ExtrinsicResolver {
    constructor(private readonly extrinsicService: ExtrinsicService) {}

    @Query(returns => [ExtrinsicType])
    async extrinsics() {
        return this.extrinsicService.findAll();
    }

    @Mutation(returns => ExtrinsicType)
    async createExtrinsic(@Args('input') input: ExtrinsicType) {
        return this.extrinsicService.create(input);
    }

    @Mutation(returns => ExtrinsicType)
    async updateExtrinsic(@Args('id') id: string, @Args('input') input: ExtrinsicType) {
        return this.extrinsicService.update(id, input);
    }

    @Mutation(returns => ExtrinsicType)
    async deleteExtrinsic(@Args('id') id: string) {
    return this.extrinsicService.delete(id);
}
}
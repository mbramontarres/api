import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BlockService } from './block.service';
import { BlockArgs } from './dto/block.args';
import { BlockType } from './dto/block.dto';

@Resolver()
export class BlockResolver {
    constructor(private readonly blockService: BlockService) {}

    @Query(returns => [BlockType])
    async blocks(@Args() blocksArgs: BlockArgs) {
        return this.blockService.findAll(blocksArgs);
    }


    @Mutation(returns => BlockType)
    async createBlock(@Args('input') input: BlockType) {
        return this.blockService.create(input);
    }

    @Mutation(returns => BlockType)
    async updateBlock(@Args('id') id: string, @Args('input') input: BlockType) {
        return this.blockService.update(id, input);
    }

    @Mutation(returns => BlockType)
    async deleteBlock(@Args('id') id: string) {
    return this.blockService.delete(id);
    }
}

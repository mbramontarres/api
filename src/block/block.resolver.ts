import { Args, Int, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
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

    @Query(returns => BlockType, { nullable: true })
    async block(@Args('blockNum') blockNum: Number) {
        return this.blockService.findOne(blockNum);
    }
    @Query(returns => Int)
    async blocksCount() {
        return this.blockService.count();
    }

}

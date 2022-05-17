import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExtrinsicService } from './extrinsic.service';
import { ExtrinsicType } from './dto/extrinsic.dto';
import { ExtrinsicArgs } from './dto/extrinsic.args';

@Resolver()
export class ExtrinsicResolver {
    constructor(private readonly extrinsicService: ExtrinsicService) {}

    @Query(returns => [ExtrinsicType])
    async extrinsics(@Args() extrinsicArgs: ExtrinsicArgs) {
        return this.extrinsicService.findAll(extrinsicArgs);
    }

    @Query(returns => ExtrinsicType, { nullable: true })
    async extrinsic(@Args('blockNum') blockNum: Number,@Args('extrinsicIndex') extrinsicIndex: Number) {
        return this.extrinsicService.findOne(blockNum,extrinsicIndex);
    }

    @Query(returns => Int)
    async extrinsicsCount() {
        return this.extrinsicService.count();
    }
}
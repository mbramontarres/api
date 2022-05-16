import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { TransferArgs } from './dto/transfer.args';
import { TransferType } from './dto/transfer.dto';
import { TransferService } from './transfer.service';

@Resolver()
export class TransferResolver {
    constructor(private readonly transferService: TransferService) {}

    @Query(returns => [TransferType])
    async transfers(@Args() blocksArgs: TransferArgs) {
        return this.transferService.findAll(blocksArgs);
    }

    @Query(returns => [TransferType])
    async accountTransfers(@Args('accountId') accountId:string, @Args() blocksArgs: TransferArgs) {
        return this.transferService.findAccountTransfers(accountId,blocksArgs);
    }

    @Query(returns => TransferType)
    async transfer(@Args('hash') hash: String) {
        return this.transferService.findOne(hash);
    }

    @Query(returns => Int)
    async transfersCount() {
        return this.transferService.count();
    }

}

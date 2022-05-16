import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { AccountArgs } from './dto/account.args';
import { AccountType } from './dto/account.dto';

@Resolver()
export class AccountResolver {
    constructor(private readonly accountService: AccountService) {}

    @Query(returns => [AccountType])
    async accounts(@Args() accountArgs: AccountArgs) {
        return this.accountService.findAll(accountArgs);
    }

    @Query(returns => AccountType)
    async account(@Args('accountId') accountId: String) {
        return this.accountService.findOne(accountId);
    }

    @Query(returns => Int)
    async accountsCount() {
        return this.accountService.count();
    }
}

import { Repository, RepositoryProps } from './repository'

export type Account = {
  accountName: string
  accountId: string
}

export class AccountsRepository extends Repository {
  constructor(props: RepositoryProps) {
    // For compatibility, key is `account-name`, regardless of its functionality.
    super('account-name', props)
  }
}

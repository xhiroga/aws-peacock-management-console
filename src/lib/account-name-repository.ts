import { Repository, RepositoryProps } from './repository'

export type AccountName = {
  accountName: string
  accountId: string
}

export class AccountNameRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('account-name', props)
  }
}

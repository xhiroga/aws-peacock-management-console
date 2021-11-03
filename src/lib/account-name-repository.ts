import { Repository, RepositoryProps } from './repository'

export type AccountName = {
  name: string
  accountId: string
}

export class AccountNameRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('account-name', props)
  }
}

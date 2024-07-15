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

  getAccounts = async (): Promise<Account[] | null> => {
    const accounts = await this.get()
    return accounts ? (JSON.parse(accounts) as Account[]) : null
  }

  setAccounts = async (accounts: Account[]): Promise<void> => {
    const accountsString = JSON.stringify(accounts)
    return this.set(accountsString)
  }
}

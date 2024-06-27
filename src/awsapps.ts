import {
  Account,
  AccountsRepository,
} from './lib/account-name-repository'
import { RepositoryProps } from './lib/repository'
import { toAccountNameAndId } from './lib/scraping'

let accounts: Account[] = []

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const accountsRepository = new AccountsRepository(repositoryProps)

type OnSubtreeUpdated = (stopObserve: () => void) => void

const observeApp = (onSubtreeUpdated: OnSubtreeUpdated) => {
  const root = document.getElementById('root') as HTMLDivElement
  if (!root) {
    console.error('AWS SSO page has no <div id ="root">.')
    return
  }
  const mutationCallback = (
    _: MutationRecord[],
    observer: MutationObserver
  ) => {
    onSubtreeUpdated(() => observer.disconnect())
  }
  const config = { attributes: false, childList: true, subtree: true }
  const observer = new MutationObserver(mutationCallback)
  observer.observe(root, config)
}

const mergeAccounts = (accounts1: Account[], accounts2: Account[]): Account[] => {
  const accountIds = accounts1.map(account => account.accountId).concat(accounts2.map(account => account.accountId))
  const merged = accountIds.map(accountId => {
    const account = accounts2.find(account => account.accountId == accountId)
    if (account) {
      return account
    } else {
      return accounts1.find(account => account.accountId == accountId) as Account
    }
  })
  return merged
}

const saveAccountNameIfAwsAccountSelected = (callback: () => void) => {
  try {
    const accountListCells = document.querySelectorAll<HTMLButtonElement>('[data-testid="account-list-cell"]');
    const queriedAccounts = Array.from(accountListCells).map(toAccountNameAndId).filter(account => account !== null) as Account[];
    accounts = mergeAccounts(accounts, queriedAccounts)
    accountsRepository.set(JSON.stringify(accounts))
  } catch (error) {
    console.error(error)
    callback()
  }
}

observeApp(saveAccountNameIfAwsAccountSelected)

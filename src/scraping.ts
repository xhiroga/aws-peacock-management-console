import {
  AccountName,
  AccountNameRepository,
} from './lib/account-name-repository'
import { RepositoryProps } from './lib/repository'

let accounts: AccountName[] = []

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const accountNameRepository = new AccountNameRepository(repositoryProps)

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

const mergeAccounts = (accounts1: AccountName[], accounts2: AccountName[]): AccountName[] => {
  const accountIds = accounts1.map(account => account.accountId).concat(accounts2.map(account => account.accountId))
  const merged = accountIds.map(accountId => {
    const account = accounts2.find(account => account.accountId == accountId)
    if (account) {
      return account
    } else {
      return accounts1.find(account => account.accountId == accountId) as AccountName
    }
  })
  return merged
}

const toAccountNameAndId = (
  accountListCell: HTMLButtonElement
): AccountName | null => {
  const accountName =
    accountListCell.querySelector<HTMLElement>('strong')?.textContent
  const divs = accountListCell.querySelectorAll<HTMLDivElement>('div')
  const accountId = Array.from(divs).map(div => div.textContent?.match(/^\d{12}/)?.[0]?.trim()).find(id => id != null);
  return accountName && accountId ? { accountName, accountId } : null
}

const saveAccountNameIfAwsAccountSelected = (callback: () => void) => {
  try {
    const accountListCells = document.querySelectorAll<HTMLButtonElement>('[data-testid="account-list-cell"]');
    const queriedAccounts = Array.from(accountListCells).map(toAccountNameAndId).filter(account => account !== null) as AccountName[];
    accounts = mergeAccounts(accounts, queriedAccounts)
    accountNameRepository.set(JSON.stringify(accounts))
  } catch (error) {
    console.error(error)
    callback()
  }
}

observeApp(saveAccountNameIfAwsAccountSelected)

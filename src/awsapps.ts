import {
  Account,
  AccountsRepository,
} from './lib/account-name-repository'
import { RepositoryProps } from './lib/repository'
import { updateAccounts, toAccountNameAndId } from './lib/util'

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

const saveAccountNameIfAwsAccountSelected = (callback: () => void) => {
  try {
    const accountListCells = document.querySelectorAll<HTMLButtonElement>('[data-testid="account-list-cell"]');
    const queriedAccounts = Array.from(accountListCells).map(toAccountNameAndId).filter(account => account !== null) as Account[];
    accounts = updateAccounts(accounts, queriedAccounts)
    // When opening the Management Console from the AWS access portal, it navigates to https://*.awsapps.com/start/#/console. This condition ensures that accounts are not reset.
    if (accounts.length > 0) {
      accountsRepository.setAccounts(accounts)
    }
  } catch (error) {
    console.error(error)
    callback()
  }
}

observeApp(saveAccountNameIfAwsAccountSelected)

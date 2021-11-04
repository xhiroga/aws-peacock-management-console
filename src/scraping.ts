import {
  AccountName,
  AccountNameRepository,
} from './lib/account-name-repository'

const accountNameRepository = new AccountNameRepository({
  browser: chrome,
  storageArea: 'local',
})

type OnAwsAccountApplicationSelected = (stopObserve: () => void) => void

const observeApp = (
  onAwsAccountApplicationSelected: OnAwsAccountApplicationSelected
) => {
  const app = document.querySelector<HTMLElement>('app')
  if (!app) {
    console.error('AWS SSO page has no <app>.')
    return
  }
  const mutationCallback = (
    _: MutationRecord[],
    observer: MutationObserver
  ) => {
    onAwsAccountApplicationSelected(() => observer.disconnect())
  }
  const config = { attributes: false, childList: true, subtree: true }
  const observer = new MutationObserver(mutationCallback)
  observer.observe(app, config)
}

const isAwsAccountSelected = (): boolean =>
  document
    .querySelector<HTMLElement>('portal-application[title="AWS Account"]')
    ?.classList.contains('selected') ?? false

const toAccountNameAndId = (
  portalInstanceSection: HTMLDivElement
): AccountName | null => {
  const accountName =
    portalInstanceSection.querySelector<HTMLDivElement>('div.name')?.textContent
  const accountId = portalInstanceSection
    .querySelector<HTMLSpanElement>('span.accountId')
    ?.textContent?.replace('#', '')
  return accountName && accountId ? { accountName, accountId } : null
}

const saveAccountName = (callback: () => void) => {
  if (!isAwsAccountSelected()) {
    return
  }
  const portalInstanceSection = document.querySelectorAll<HTMLDivElement>(
    'div.portal-instance-section'
  )
  if (!portalInstanceSection) {
    console.error('portal-instance-section is not detected.')
    return
  }
  accountNameRepository.set(
    JSON.stringify(Array.from(portalInstanceSection).map(toAccountNameAndId))
  )
  callback()
}

observeApp(saveAccountName)

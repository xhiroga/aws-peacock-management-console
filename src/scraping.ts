import {
  AccountName,
  AccountNameRepository,
} from './lib/account-name-repository'

const accountNameRepository = new AccountNameRepository({
  browser: chrome,
  storageArea: 'local',
})

const getPortalApplicationList = () =>
  document.getElementsByTagName('portal-application-list')[0]

type OnAwsAccountApplicationSelected = (stopObserve: () => void) => void

const observePortalApplicationList = (
  onAwsAccountApplicationSelected: OnAwsAccountApplicationSelected
) => {
  const portalApplicationList = getPortalApplicationList()
  const mutationCallback = (
    _: MutationRecord[],
    observer: MutationObserver
  ) => {
    onAwsAccountApplicationSelected(() => observer.disconnect())
  }
  const config = { attributes: false, childList: true, subtree: false }
  const observer = new MutationObserver(mutationCallback)
  observer.observe(portalApplicationList, config)
}

const isAwsAccountSelected = (): boolean => {
  const appAwsAccount = document.querySelectorAll(
    'portal-application[title="AWS Account"]'
  )[0]
  return appAwsAccount.classList.contains('selected')
}

const toAccountNameAndId = (
  portalInstanceSection: HTMLDivElement
): AccountName | null => {
  const accountName =
    portalInstanceSection.querySelector<HTMLDivElement>('div.name')?.textContent
  const accountId = portalInstanceSection
    .querySelector<HTMLSpanElement>('span.accountId')
    ?.textContent?.replace('#', '')
  console.log(accountId)
  if (accountName && accountId) {
    return { accountName, accountId }
  } else {
    return null
  }
}

const saveAccountName = (callback: () => void) => {
  if (!isAwsAccountSelected()) {
    return
  }
  const portalInstanceSection = document.querySelectorAll<HTMLDivElement>(
    'div.portal-instance-section'
  )
  if (portalInstanceSection === null) {
    console.error('portal-instance-section is not detected.')
    return
  }
  accountNameRepository.set(
    JSON.stringify(Array.from(portalInstanceSection).map(toAccountNameAndId))
  )
  callback()
}

window.onload = async () => {
  window.setTimeout(
    () => observePortalApplicationList(saveAccountName),
    0.5 * 1000
  )
}

import { AccountNameRepository } from './lib/account-name-repository'

const accountNameRepository = new AccountNameRepository({
  browser: chrome,
  storageArea: 'local',
})

const getPortalApplicationList = () =>
  document.getElementsByTagName('portal-application-list')[0]

const isAwsAccountSelected = (): boolean => {
  const appAwsAccount = document.querySelectorAll(
    'portal-application[title="AWS Account"]'
  )[0]
  return appAwsAccount.classList.contains('selected')
}

type OnAwsAccountApplicationSelected = (stopObserve: () => void) => void

const observePortalApplicationList = (
  onAwsAccountApplicationSelected: OnAwsAccountApplicationSelected
) => {
  const portalApplicationList = getPortalApplicationList()
  const mutationCallback = (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => {
    console.log(mutationList)
    onAwsAccountApplicationSelected(() => observer.disconnect())
  }
  const config = { attributes: false, childList: true, subtree: false }
  const observer = new MutationObserver(mutationCallback)
  observer.observe(portalApplicationList, config)
}

const saveAccountName = (callback: () => void) => {
  if (!isAwsAccountSelected()) {
    return
  }
  Array.prototype.filter.call(
    document.getElementsByClassName('portal-instance-section'),
    console.log
  )
  callback()
}

window.onload = async () => {
  window.setTimeout(
    () => observePortalApplicationList(saveAccountName),
    1 * 1000
  )
}

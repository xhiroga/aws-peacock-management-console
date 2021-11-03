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

type OnAwsAccountSelected = (stopObserve: () => void) => void
const onAwsAccountSelected = (callback: () => void) => {
  if (!isAwsAccountSelected()) {
    return
  }
  Array.prototype.filter.call(
    document.getElementsByClassName('instance-section'),
    console.log
  )
  callback()
}

const observePortalApplicationList = (
  onAwsAccountSelected: OnAwsAccountSelected
) => {
  const portalApplicationList = getPortalApplicationList()
  const mutationCallback = (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => {
    console.log(mutationList)
    onAwsAccountSelected(() => observer.disconnect())
  }
  const config = { attributes: false, childList: true, subtree: false }
  const observer = new MutationObserver(mutationCallback)
  observer.observe(portalApplicationList, config)
}

window.onload = async () => {
  window.setTimeout(
    () => observePortalApplicationList(onAwsAccountSelected),
    1 * 1000
  )
}

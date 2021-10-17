import { parse } from 'jsonc-parser'
import { Config, ConfigList, ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const selectElement = (query: string): HTMLElement | undefined =>
  document.querySelectorAll<HTMLElement>(query)[0]

const getAccountId = (): string | undefined => {
  return selectElement('[data-testid="aws-my-account-details"]')?.innerText
}
const getHeader = (): HTMLElement | undefined => {
  return selectElement('[id="awsc-nav-header"]')
}

const loadConfigList = async (): Promise<ConfigList> => {
  return parse(await configRepository.get())
}

const applyColor = (accountId: string, configList: ConfigList): void => {
  const config = configList.find((config: Config) =>
    config.accounts?.includes(accountId)
  )
  const headerElement = getHeader()
  if (config && headerElement) {
    headerElement.style.backgroundColor = config.color
  }
}

const run = async () => {
  const configList = await loadConfigList()
  const accountId = getAccountId()
  if (accountId === undefined) {
    console.error('Cannot detect account id.')
    return
  }
  applyColor(accountId, configList)
}
run()

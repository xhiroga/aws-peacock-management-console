import { parse } from 'jsonc-parser'
import { Config, ConfigList, ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const selectElement = (query: string): HTMLElement | undefined =>
  document.querySelectorAll<HTMLElement>(query)[0]

const getAccountId = (): string | undefined => {
  return selectElement('[data-testid="aws-my-account-details"]')?.innerText
}

const getRegion = () => {
  return document.getElementById('awsc-mezz-region')?.getAttribute('content')
}

const getHeader = (): HTMLElement | undefined => {
  return selectElement('[data-testid="awsc-nav-header-viewport-shelf-inner"]')
}

const getFooter = (): HTMLElement | undefined => {
  return selectElement('[id="console-nav-footer-inner"]')
}

const loadConfigList = async (): Promise<ConfigList> => {
  return parse(await configRepository.get())
}

const applyColor = (
  configList: ConfigList,
  accountId: string,
  region: string
): void => {
  const config = configList.find(
    (config: Config) =>
      config.accounts.includes(accountId) &&
      (config.regions ? config.regions.includes(region) : true)
  )
  const header = getHeader()
  const footer = getFooter()
  if (config && header) {
    header.style.backgroundColor = config.color
  }
  if (config && footer) {
    footer.style.backgroundColor = config.color
  }
}

const run = async () => {
  const configList = await loadConfigList()
  const accountId = getAccountId()
  const region = getRegion()
  if (configList && accountId && region) {
    applyColor(configList, accountId, region)
  }
}
run()

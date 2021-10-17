import { parse } from 'jsonc-parser'
import { Config, ConfigList, ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const selectElement = (query: string): HTMLElement | undefined =>
  document.querySelectorAll<HTMLElement>(query)[0]

const getAccountId = (): string | undefined => {
  return selectElement('[data-testid="aws-my-account-details"]')?.innerText
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

const applyColor = (accountId: string, configList: ConfigList): void => {
  const config = configList.find((config: Config) =>
    config.accounts?.includes(accountId)
  )
  const header = getHeader()
  const footer = getFooter()
  if (config && header && footer) {
    header.style.backgroundColor = config.color
    footer.style.backgroundColor = config.color
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

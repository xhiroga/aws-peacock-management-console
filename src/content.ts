import { parse } from 'jsonc-parser'
import { ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const selectElement = (query: string): HTMLElement | undefined =>
  document.querySelectorAll<HTMLElement>(query)[0]

const getAccountId = (): string | undefined => {
  return selectElement('[data-testid="aws-my-account-details"]')?.innerText
}
const getHeader = (): HTMLElement | undefined => {
  return selectElement('[id="awsc-nav-header"]')
}

const loadConfig = async () => {
  return parse(await configRepository.get())
}

const selectColor = (config: any, accountId: string) => {
  return config.find((color: any) => color.accountId === accountId)
}

const patchColor = (color: any) => {
  const headerElement = getHeader()
  if (headerElement !== undefined) {
    headerElement.style.backgroundColor = color.color
  }
}

const run = async () => {
  const config = await loadConfig()
  const accountId = getAccountId()
  if (accountId === undefined) {
    console.error('Cannot detect account id.')
    return
  }
  const color = selectColor(config, accountId)
  patchColor(color)
}
run()

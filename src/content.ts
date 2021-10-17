import { ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const selectElement = (query: string): HTMLElement =>
  document.querySelectorAll<HTMLElement>(query)[0]

const getAccountId = (): string => {
  return selectElement('[data-testid="aws-my-account-details"]').innerText
}
const getHeader = () => {
  return selectElement('[id="awsc-nav-header"]')
}

const loadConfig = async () => {
  return await configRepository.get() // ex. '[{"accountId": "123456789012","color": "#377d22"}]'
}

const selectColor = (config: any, accountId: string) => {
  return config.find((color: any) => color.accountId === accountId)
}

const patchColor = (color: any) => {
  const headerElement = getHeader()
  headerElement.style.backgroundColor = color.color
}

const run = async () => {
  const config = await loadConfig()
  const accountId = getAccountId()
  const color = selectColor(config, accountId)
  patchColor(color)
}
run()

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

const findConfig = (
  configList: ConfigList,
  accountId: string,
  region: string
): Config | undefined => {
  return configList.find(
    (config: Config) =>
      config.accounts.includes(accountId) &&
      (config.regions ? config.regions.includes(region) : true)
  )
}

const getLuminance = (r: number, g: number, b: number) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255

const isLuminanceEnough = (color: string): boolean | undefined => {
  const rrggbb = color.match(
    /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/
  )
  if (rrggbb) {
    const r = parseInt(rrggbb[1], 16)
    const g = parseInt(rrggbb[2], 16)
    const b = parseInt(rrggbb[3], 16)
    return getLuminance(r, g, b) > 0.5
  }

  const rgbDecimal = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgbDecimal) {
    const r = parseInt(rgbDecimal[1], 10)
    const g = parseInt(rgbDecimal[2], 10)
    const b = parseInt(rgbDecimal[3], 10)
    return getLuminance(r, g, b) > 0.5
  }

  return undefined
}

const createStyleTagInvertText = () => {
  const css =
    'header#awsc-nav-header * :not(div[class^="globalNav-search"] *), div#console-nav-footer-inner * { color: #16191F !important; }'
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  head.appendChild(style)
  style.appendChild(document.createTextNode(css))
}

const applyNavigationBackgroundColor = (color: string): void => {
  const header = getHeader()
  const footer = getFooter()
  if (color && header && footer) {
    header.style.backgroundColor = color
    footer.style.backgroundColor = color
    if (isLuminanceEnough(color)) {
      createStyleTagInvertText()
    }
  }
}

const run = async () => {
  const configList = await loadConfigList()
  const accountId = getAccountId()
  const region = getRegion()
  if (!(configList && accountId && region)) {
    return
  }
  const config = findConfig(configList, accountId, region)
  config?.navigationBackgroundColor &&
    applyNavigationBackgroundColor(config?.navigationBackgroundColor)
}
run()

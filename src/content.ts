import { parse } from 'jsonc-parser'
import { Config, ConfigList, ConfigRepository } from './lib/config-repository'

const AWS_SQUID_INK = '#232f3e'
const AWSUI_COLOR_GRAY_300 = '#d5dbdb'
const AWSUI_COLOR_GRAY_900 = '#16191f'

const configRepository = new ConfigRepository(chrome, 'local')

const selectElement = (query: string): HTMLElement | undefined =>
  document.querySelectorAll<HTMLElement>(query)[0]

const getAccountId = (): string | undefined => {
  return selectElement('[data-testid="aws-my-account-details"]')?.innerText
}

const getRegion = () => {
  return document.getElementById('awsc-mezz-region')?.getAttribute('content')
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

const isLuminant = (color: string): boolean | undefined => {
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

const overwriteStyle = (style: Config['style']) => {
  const headerBackground = style.navigationBackgroundColor ?? AWS_SQUID_INK
  const headerForeground = isLuminant(headerBackground)
    ? AWSUI_COLOR_GRAY_900
    : AWSUI_COLOR_GRAY_300
  const footerBackground = style.navigationBackgroundColor ?? AWS_SQUID_INK
  const footerForeground = isLuminant(footerBackground)
    ? AWSUI_COLOR_GRAY_900
    : AWSUI_COLOR_GRAY_300

  const css = `
  div[data-testid="awsc-nav-header-viewport-shelf-inner"] {
    background-color: ${headerBackground} !important;
  }
  button[data-testid="aws-services-list-button"],
  button[data-testid="aws-services-list-button"] *,
  button[data-testid="awsc-phd__bell-icon"] *,
  button[data-testid="more-menu__awsc-nav-account-menu-button"] *,
  button[data-testid="more-menu__awsc-nav-regions-menu-button"] *,
  button[data-testid="more-menu__awsc-nav-support-menu-button"] * {
    color: ${headerForeground} !important;
  }
  div#awsc-nav-footer-content {
    background-color: ${footerBackground} !important;
  }
  div#awsc-feedback,
  button[data-testid="awsc-footer-language-selector-button"],
  a[data-testid="awsc-footer-privacy-policy"],
  a[data-testid="awsc-footer-terms-of-use"],
  button[data-testid="awsc-footer-cookie-preferences"] {
    color: ${footerForeground} !important;
  }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const styleElement = document.createElement('style')
  head.appendChild(styleElement)
  styleElement.appendChild(document.createTextNode(css))
}

const run = async () => {
  const configList = await loadConfigList()
  const accountId = getAccountId()
  const region = getRegion()
  if (!(configList && accountId && region)) {
    return
  }
  const config = findConfig(configList, accountId, region)
  config?.style && overwriteStyle(config?.style)
}
run()

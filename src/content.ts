import * as JSONC from 'jsonc-parser'
import yaml from 'js-yaml'
import {
  AccountsRepository,
} from './lib/account-name-repository'
import {
  Config,
  ConfigList,
  ConfigRepository,
  Environment,
} from './lib/config-repository'
import { RepositoryProps } from './lib/repository'
import { patchAccountNameIfAwsSso, selectElement } from './lib/util'

const AWS_SQUID_INK = '#232f3e'
const AWSUI_COLOR_GRAY_300 = '#d5dbdb'
const AWSUI_COLOR_GRAY_900 = '#16191f'

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const configRepository = new ConfigRepository(repositoryProps)
const accountsRepository = new AccountsRepository(repositoryProps)

const waitForElement = async (selector: string, timeout: number): Promise<HTMLElement> => {
  let elapsedTime = 0;
  while (elapsedTime < timeout) {
    const element = selectElement(selector);
    if (element !== null) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    elapsedTime += 100;
  }
  throw new Error(`Element ${selector} not found after ${timeout}ms`);
}

const getOriginalAccountMenuButtonBackground = () => {
  return selectElement('span[data-testid="account-menu-button__background"]')
}

const getAccountIdFromDescendantByDataTestidEqualsAwscCopyAccountId = (accountDetailMenu: HTMLElement): string | null => {
  const copyAccountIdButton = accountDetailMenu.querySelector<HTMLElement>('button[data-testid="awsc-copy-accountid"]')
  return (copyAccountIdButton?.previousElementSibling as HTMLSpanElement)?.innerText?.replace(/-/g, '')
}

const getAccountIdByRegex = (accountDetailMenu: HTMLElement) => {
  let accountId = null;
  const regex = /^\d{4}-\d{4}-\d{4}$/; // Regular expression to match the pattern ****-****-****
  const spans = accountDetailMenu.querySelectorAll('span');

  spans.forEach(span => {
    const spanText = span.textContent ? span.textContent.trim() : '';
    if (regex.test(spanText)) {
      accountId = spanText.replace(/-/g, '');
    }
  });

  return accountId;
}

const getAccountId = async (): Promise<string | null | undefined> => {
  try {
    const accountDetailMenu = await waitForElement('div[data-testid="account-detail-menu"]', 10000)
    return getAccountIdFromDescendantByDataTestidEqualsAwscCopyAccountId(accountDetailMenu) || getAccountIdByRegex(accountDetailMenu);
  } catch (e) {
    console.error(e)
    return null
  }
}

const getRegion = () => {
  return document.getElementById('awsc-mezz-region')?.getAttribute('content')
}

const loadConfigList = async (): Promise<ConfigList | null> => {
  const configList = await configRepository.get()
  if (configList) {
    return parseConfigList(configList)
  } else {
    return null
  }
}

const parseConfigList = (configList: string) => {
  try {
    return yaml.load(configList) as ConfigList
  } catch (e) {
    return JSONC.parse(configList) as ConfigList
  }
}

const isEnvMatch = (env: Environment, accountId: string, region: string) =>
  String(env.account) === accountId && (env.region ? env.region === region : true)

const findConfig = (
  configList: ConfigList,
  accountId: string,
  region: string
): Config | undefined =>
  configList.find((config: Config) => {
    if (Array.isArray(config.env)) {
      return config.env.some((e) => isEnvMatch(e, accountId, region))
    } else {
      return isEnvMatch(config.env, accountId, region)
    }
  })

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

const insertStyleTag = (css: string) => {
  const style = document.createElement('style')
  style.setAttribute('type', 'text/css')
  style.appendChild(document.createTextNode(css))
  const head = document.head || document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

const updateAwsLogo = (color: string) => {
  const css = `
  a[data-testid="nav-logo"] > svg > path:first-of-type{
    fill: ${color} !important;
  }`
  insertStyleTag(css)
}

const whiteSearchBox = () => {
  const css = `
  input[data-testid="awsc-concierge-input"] {
    color: ${AWSUI_COLOR_GRAY_900} !important;
    background-color: #ffffff !important;
  }`
  insertStyleTag(css)
}

const insertAccountMenuButtonBackground = (
  accountMenuButtonBackgroundColor: string
) => {
  const accountMenuButtonBackground = document.createElement('span')
  accountMenuButtonBackground.setAttribute(
    'peacock-id',
    `peacock-account-menu-button__background`
  )
  selectElement('[data-testid="awsc-nav-account-menu-button"]')?.prepend(
    accountMenuButtonBackground
  )
  const css = `
  span[peacock-id='peacock-account-menu-button__background'] {
    background-color: ${accountMenuButtonBackgroundColor}; position: absolute; left: 0; right: 0; top: 0; bottom: 0; border-radius: 10px; height: 18px; opacity: 0; z-index: 1; margin: 10px;
  }
  @media only screen and (min-width: 620px) {
    span[peacock-id='peacock-account-menu-button__background'] {
      opacity: 1 !important;
    }
  }`
  insertStyleTag(css)
}

const hideOriginalAccountMenuButtonBackground = () => {
  const originalAccountMenuBackground = getOriginalAccountMenuButtonBackground()
  originalAccountMenuBackground?.setAttribute('hidden', 'true')
}

const updateNavigationStyle = (
  navigationBackgroundColor: string,
  accountMenuButtonBackgroundColorEnabled: boolean
) => {
  const foregroundColor = isLuminant(navigationBackgroundColor)
    ? AWSUI_COLOR_GRAY_900
    : AWSUI_COLOR_GRAY_300

  const awsLogoTypeColor = isLuminant(navigationBackgroundColor)
    ? AWS_SQUID_INK
    : '#ffffff'

  // Selector specification policy
  // 1. Use `id` or `data-testid`
  // 2. To minimize the impact of layout disruptions, set up CSS selectors for each UI's smallest elements (Atoms). 
  // 3. Use the `data-testid` of the closest parent element of the element you want to change the color of.
  // 4. Conversely, within Atoms, use the Descendent Selector to avoid the effects of AWS refactoring.
  // 5. Instead of specifying `path`, `g`, `circle` individually, use `svg > *`.
  const css = `
  header[data-testid="awsc-nav-header"] nav {
    background-color: ${navigationBackgroundColor} !important;
  }
  button[data-testid="aws-services-list-button"],
  button[data-testid="aws-services-list-button"] *,
  button[data-testid="awsc-concierge-open-search-button"] > svg > *,
  a[data-testid="awsc-nav-scallop-icon"] svg > *,
  div[data-testid="awsc-phd__bell-icon"] svg > *,
  span[data-testid="awsc-nav-support-menu-button"] svg > *,
  span[data-testid="awsc-nav-quick-settings-button"] svg > *,
  button[data-testid="awsc-nav-more-menu"] {
    color: ${foregroundColor} !important;
  }
  @media only screen and (min-width: 620px) {
    ${accountMenuButtonBackgroundColorEnabled ||
      getOriginalAccountMenuButtonBackground()
      ? ''
      : 'button[data-testid="more-menu__awsc-nav-account-menu-button"] *,'
    }
    button[data-testid="more-menu__awsc-nav-regions-menu-button"] > span > *,
    #awsc-nav-header > nav > div:nth-child(2) > div > ol > li > a > div > span
    {
      color: ${foregroundColor} !important;
    }
    #awsc-nav-header > nav > div:nth-child(2) > div > ol > li > a:hover,
    #awsc-nav-header > nav > div:nth-child(2) > div > ol > li > a[style*=fixed]
    {
      background-color: ${navigationBackgroundColor} !important;
    }
  }
  #awsc-nav-footer-content {
    background-color: ${navigationBackgroundColor} !important;
  }
  #awsc-nav-footer-content * {
    color: ${foregroundColor} !important;
  }`
  insertStyleTag(css)
  updateAwsLogo(awsLogoTypeColor)
  whiteSearchBox()
}

const updateAccountMenuButtonStyle = (
  accountMenuButtonBackgroundColor: string
) => {
  const foregroundColor = isLuminant(accountMenuButtonBackgroundColor)
    ? AWSUI_COLOR_GRAY_900
    : AWSUI_COLOR_GRAY_300

  const css = `
  @media only screen and (min-width: 620px) {
    button[data-testid="more-menu__awsc-nav-account-menu-button"] {
      color: ${foregroundColor} !important;
      padding-top: 0;
      padding-bottom: 0;
      border-radius: 10px;
    }
  }`
  hideOriginalAccountMenuButtonBackground()
  insertStyleTag(css)
  insertAccountMenuButtonBackground(accountMenuButtonBackgroundColor)
}

const updateStyle = (style: Config['style']) => {
  if (style.accountMenuButtonBackgroundColor) {
    updateAccountMenuButtonStyle(style.accountMenuButtonBackgroundColor)
  }
  if (style.navigationBackgroundColor) {
    updateNavigationStyle(
      style.navigationBackgroundColor,
      style.accountMenuButtonBackgroundColor !== undefined
    )
  }
}

const run = async () => {
  const accounts = await accountsRepository.getAccounts()
  const configList = await loadConfigList()
  const accountId = await getAccountId()
  const region = getRegion()
  if (configList && accountId && region) {
    const config = findConfig(configList, accountId, region)
    if (config?.style) {
      updateStyle(config?.style)
    }
  }
  if (accounts && accountId) {
    const account = accounts.find(
      (account) => account.accountId === accountId
    )
    if (account) {
      patchAccountNameIfAwsSso(account)
    }
  }
}

run()

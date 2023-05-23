import * as JSONC from 'jsonc-parser'
import yaml from 'js-yaml'
import {
  AccountName,
  AccountNameRepository,
} from './lib/account-name-repository'
import {
  Config,
  ConfigList,
  ConfigRepository,
  Environment,
} from './lib/config-repository'
import { RepositoryProps } from './lib/repository'

const AWS_SQUID_INK = '#232f3e'
const AWSUI_COLOR_GRAY_300 = '#d5dbdb'
const AWSUI_COLOR_GRAY_900 = '#16191f'

const AWS_SERVICE_ROLE_FOR_SSO_PREFIX = /AWSReservedSSO_/ // https://docs.aws.amazon.com/singlesignon/latest/userguide/using-service-linked-roles.html
const AWS_IAM_ROLE_NAME_PATTERN = /[\w+=,.@-]+/ // https://docs.aws.amazon.com/IAM/latest/APIReference/API_CreateRole.html
const AWS_SSO_USR_NAME_PATTERN = /[\w+=,.@-]+/ // Username can contain alphanumeric characters, or any of the following: +=,.@-

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const configRepository = new ConfigRepository(repositoryProps)
const accountNameRepository = new AccountNameRepository(repositoryProps)

const selectElement = (query: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(query)

const getAccountMenuButtonTitle = () => {
  return selectElement(
    '[data-testid="more-menu__awsc-nav-account-menu-button"] span[title]'
  )
}

const getOriginalAccountMenuButtonBackground = () => {
  return selectElement('span[data-testid="account-menu-button__background"]')
}

const getAccountId = (): string | null | undefined => {
  return (
    selectElement('button[data-testid="awsc-copy-accountid"]')
      ?.previousElementSibling as HTMLSpanElement
  )?.innerText.replace(/\-/g, '')
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

const loadAccountNameList = async (): Promise<AccountName[] | null> => {
  const accountNameList = await accountNameRepository.get()
  return accountNameList ? (JSON.parse(accountNameList) as AccountName[]) : null
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

  const css = `
  header[data-testid="awsc-nav-header"] nav {
    background-color: ${navigationBackgroundColor} !important;
  }
  button[data-testid="aws-services-list-button"],
  button[data-testid="aws-services-list-button"] *,
  button[data-testid="awsc-concierge-open-search-button"] > svg > *,
  a[data-testid="awsc-nav-scallop-icon"] > svg > path,
  div[data-testid="awsc-phd__bell-icon"] *,
  span[data-testid="awsc-nav-support-menu-button"] > svg > *,
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
    #awsc-nav-header > nav > nav > div:nth-child(2) > div > ol > li > a > div > span
    {
      color: ${foregroundColor} !important;
    }
    #awsc-nav-header > nav > nav > div:nth-child(2) > div > ol > li > a:hover,
    #awsc-nav-header > nav > nav > div:nth-child(2) > div > ol > li > a[style*=fixed]
    {
      background-color: ${navigationBackgroundColor} !important;
    }
  }
  div#awsc-nav-footer-content {
    background-color: ${navigationBackgroundColor} !important;
  }
  div#awsc-feedback,
  button[data-testid="awsc-footer-language-selector-button"],
  a[data-testid="awsc-footer-privacy-policy"],
  a[data-testid="awsc-footer-terms-of-use"],
  span[data-testid="awsc-footer-unified-settings-language-link"],
  button[data-testid="awsc-footer-cookie-preferences"],
  span[data-testid="awsc-footer-copyright"] {
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

const isNotIamUserButAwsSsoUser = (userName: string) => {
  const awsSsoUserNameRe = new RegExp(
    `^${AWS_SERVICE_ROLE_FOR_SSO_PREFIX.source + AWS_IAM_ROLE_NAME_PATTERN.source
    }/${AWS_SSO_USR_NAME_PATTERN.source}$`
  )
  return awsSsoUserNameRe.test(userName)
}

const patchAccountNameIfAwsSso = (accountName: AccountName) => {
  const accountMenuButtonTitle = getAccountMenuButtonTitle()
  if (!accountMenuButtonTitle) {
    return
  }
  const userName = (
    selectElement('button[data-testid="awsc-copy-username"]')
      ?.previousElementSibling as HTMLSpanElement
  )?.innerText
  if (userName && isNotIamUserButAwsSsoUser(userName)) {
    accountMenuButtonTitle.innerText = `${accountMenuButtonTitle.innerText} @ ${accountName.accountName}`
  } // else not login by user, like root user or IAM role
}

const run = async () => {
  const accountNameList = await loadAccountNameList()
  const configList = await loadConfigList()
  const accountId = getAccountId()
  const region = getRegion()
  if (configList && accountId && region) {
    const config = findConfig(configList, accountId, region)
    if (config?.style) {
      updateStyle(config?.style)
    }
  }
  if (accountNameList && accountId) {
    const accountName = accountNameList.find(
      (accountName) => accountName.accountId === accountId
    )
    if (accountName) {
      patchAccountNameIfAwsSso(accountName)
    }
  }
}

function waitForElementToDisplay(selector: string, time: number) {
  var interval = setInterval(function () {
    if (document.querySelector(selector) !== null) {
      clearInterval(interval);
      run();
    }
  }, time);
}
waitForElementToDisplay("#nav-usernameMenu", 100);

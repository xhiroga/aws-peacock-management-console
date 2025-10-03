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
import { AWS_IAM_ROLE_NAME_PATTERN, parseConfigList, patchAccountName, selectElement } from './lib/util'

const AWS_SQUID_INK = '#232f3e'
const AWSUI_COLOR_GRAY_300 = '#d5dbdb'
const AWSUI_COLOR_GRAY_900 = '#16191f'

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const configRepository = new ConfigRepository(repositoryProps)
const accountsRepository = new AccountsRepository(repositoryProps)

const loadConfigList = async (): Promise<ConfigList | null> => {
  const configList = await configRepository.get()
  if (configList) {
    return parseConfigList(configList)
  } else {
    return null
  }
}

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

const getAccountId = async (): Promise<string | null> => {
  try {
    const accountDetailMenu = await waitForElement('div[data-testid="account-detail-menu"]', 10000)
    const copyAccountIdButton = accountDetailMenu.querySelector<HTMLElement>('button[data-testid="awsc-copy-accountid"]')
    const spans = copyAccountIdButton?.closest('div')?.querySelectorAll('span');

    for (const span of Array.from(spans ?? [])) {
      const spanText = span.textContent ? span.textContent.trim() : '';
      // Regular expression to match the pattern ****-****-****
      if (/^\d{4}-\d{4}-\d{4}$/.test(spanText)) {
        return spanText.replace(/-/g, '');
      }
    }
    return null
  } catch (e) {
    // Known issue: `Region Unsupported` page does not have `account-detail-menu` element.
    console.error(e)
    return null
  }
}

const getRegion = () => {
  return document.getElementById('awsc-mezz-region')?.getAttribute('content')
}

const getUsername = async (): Promise<string | null> => {
  try {
    const accountDetailMenu = await waitForElement('div[data-testid="account-detail-menu"]', 10000)
    const copyUsernameButton = accountDetailMenu.querySelector<HTMLElement>('button[data-testid="awsc-copy-username"]')
    const spans = copyUsernameButton?.closest('div')?.querySelectorAll('span');

    for (const span of Array.from(spans ?? [])) {
      const spanText = span.textContent ? span.textContent.trim() : '';
      if (AWS_IAM_ROLE_NAME_PATTERN.test(spanText)) {
        return spanText.replace(/-/g, '');
      }
    }
    return null
  } catch (e) {
    // Known issue: `Region Unsupported` page does not have `account-detail-menu` element.
    console.error(e)
    return null
  }
}

const isEnvMatch = (env: Environment, accountId: string, region: string, username: string | null) => {
  const isAccountMatch = String(env.account) === accountId
  const isRegionMatch = env.region ? env.region === region : true
  const isUsernameMatch = env.usernamePattern ? username && new RegExp(env.usernamePattern).test(username) : true
  return isAccountMatch && isRegionMatch && isUsernameMatch
}

const findConfig = (
  configList: ConfigList,
  accountId: string,
  region: string,
  username: string | null
): Config | undefined =>
  configList.find((config: Config) => {
    if (Array.isArray(config.env)) {
      return config.env.some((e) => isEnvMatch(e, accountId, region, username))
    } else {
      return isEnvMatch(config.env, accountId, region, username)
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

const insertStyleTag = (css: string, peacockId: string) => {
  const style = document.createElement('style')
  style.setAttribute('type', 'text/css')
  style.setAttribute('peacock-id', peacockId)
  style.appendChild(document.createTextNode(css))
  const head = document.head || document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

const updateAwsLogo = (color: string) => {
  const css = `
  a[data-testid="nav-logo"] > svg > path{
    fill: ${color} !important;
  }`
  insertStyleTag(css, 'update-aws-logo')
}

const whiteSearchBox = () => {
  const css = `
  input[data-testid="awsc-concierge-input"] {
    color: ${AWSUI_COLOR_GRAY_900} !important;
    background-color: #ffffff !important;
  }`
  insertStyleTag(css, 'white-search-box')
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
  // 6. DO NOT USE `area-label`as a selector. Its value is NOT stable and may change depending on the user's language settings.
  const css = `
  header[data-testid="awsc-nav-header"] > nav {
    background-color: ${navigationBackgroundColor} !important;
  }
  button[data-testid="aws-services-list-button"],
  button[data-testid="aws-services-list-button"] *,
  button[data-testid="awsc-concierge-open-search-button"] > svg > *,
  a[data-testid="awsc-nav-scallop-icon"] svg > *,
  div[data-testid="awsc-phd__bell-icon"] svg > *,
  span[data-testid="awsc-nav-support-menu-button"] svg > *,
  span[data-testid="awsc-nav-quick-settings-button"] svg > *,
  button[data-testid="awsc-nav-more-menu"],
  div[data-testid="awsc-account-info-tile"] *,
  /* Since the favorite bar has no id or data-testid, specify the sibling element */
  /* Specify <span> to avoid side effects since text in tooltip is specified with <h5> <p> */
  #awsc-top-level-nav ~ div span
  {
    color: ${foregroundColor} !important;
  }
  div[data-testid="awsc-account-info-tile"] > div > div[data-testid] span {
    background: transparent !important;
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
  insertStyleTag(css, 'update-navigation-style')
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
  div[data-testid="awsc-account-info-tile"] > div > div[data-testid] span {
    color: ${foregroundColor} !important;
    padding: 0 4px !important;
    background: ${accountMenuButtonBackgroundColor} !important;
    border-radius: 4px;
  }`
  insertStyleTag(css, 'update-account-menu-button-style')
}

const readFileAsDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.error) {
        reject(reader.error);
      } else {
        resolve(reader.result as string);
      }
    };
    reader.readAsDataURL(blob);
  });
}

const createFaviconWithBadge = async (
  href: string,
  badgeColor: string
): Promise<HTMLLinkElement | null> => {
  try {
    const response = await fetch(href);
    if (!response.ok) {
      throw new Error(`Failed to fetch favicon: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const base64EncodedOriginalFavicon = await readFileAsDataURL(blob);

    const updatedFavicon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <image href="${base64EncodedOriginalFavicon}" width="24" height="24"/>
        <polygon points="0,12 0,24 12,24" fill="${badgeColor}"/>
      </svg>
    `;
    const base64EncodedUpdatedFavicon = window.btoa(updatedFavicon);
    const dataUri = `data:image/svg+xml;base64,${base64EncodedUpdatedFavicon}`;

    const link = document.createElement('link');
    link.setAttribute('type', 'image/x-icon');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', dataUri);
    return link;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateFavicon = async (badgeColor: string) => {
  const faviconLinks = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');
  faviconLinks.forEach(async (link) => {
    if (!link.href) return;
    const faviconWithBadge = await createFaviconWithBadge(link.href, badgeColor);
    if (faviconWithBadge) {
      link.replaceWith(faviconWithBadge);
    }
  });
};

const updateStyle = (style: Config['style']) => {
  if (style.navigationBackgroundColor) {
    updateNavigationStyle(
      style.navigationBackgroundColor,
      style.accountMenuButtonBackgroundColor !== undefined
    );
    updateFavicon(style.navigationBackgroundColor);
  }
  if (style.accountMenuButtonBackgroundColor) {
    updateAccountMenuButtonStyle(style.accountMenuButtonBackgroundColor);
  }
};

const run = async () => {
  const configList = await loadConfigList()
  const accountId = await getAccountId()
  const region = getRegion()
  const username = await getUsername()
  if (configList && accountId && region) {
    const config = findConfig(configList, accountId, region, username)
    if (config?.style) {
      updateStyle(config?.style)
    }
  }

  const accountNameAndIds = await accountsRepository.getAccounts()
  if (accountId && accountNameAndIds) {
    const accountNameAndId = accountNameAndIds.find(
      (account) => account.accountId === accountId
    )
    if (accountNameAndId) {
      patchAccountName(accountNameAndId)
    }
  }
}

// Some AWS services dynamically rewrite favicons, so need to wait.
window.addEventListener('load', () => {
  run();
});

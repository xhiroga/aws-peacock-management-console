import { Account } from "./account-name-repository";
import * as JSONC from 'jsonc-parser'
import yaml from 'js-yaml'
import { ConfigList } from "./config-repository";

const AWS_SERVICE_ROLE_FOR_SSO_PREFIX = /AWSReservedSSO_/ // https://docs.aws.amazon.com/singlesignon/latest/userguide/using-service-linked-roles.html
export const AWS_IAM_ROLE_NAME_PATTERN = /[\w+=,.@-]+/ // https://docs.aws.amazon.com/IAM/latest/APIReference/API_CreateRole.html
const AWS_SSO_USR_NAME_PATTERN = /[\w+=,.@-]+/ // Username can contain alphanumeric characters, or any of the following: +=,.@-

export const parseConfigList = (configList: string) => {
  try {
    return yaml.load(configList) as ConfigList
  } catch (e) {
    return JSONC.parse(configList) as ConfigList
  }
}

export const updateAccounts = (previous: Account[], current: Account[]): Account[] => {
  const accountMap = new Map<string, Account>();

  previous.forEach(account => accountMap.set(account.accountId, account));
  current.forEach(account => accountMap.set(account.accountId, account));

  return Array.from(accountMap.values());
}

export const selectElement = (query: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(query)

export const toAccountNameAndId = (
  accountListCell: HTMLButtonElement
): Account | null => {
  const accountName = accountListCell.querySelector<HTMLElement>('strong')?.textContent
  const divs = accountListCell.querySelectorAll<HTMLDivElement>('div')
  const accountId = Array.from(divs).map(div => div.textContent?.match(/^\d{12}/)?.[0]?.trim()).find(id => id != null);
  return accountName && accountId ? { accountName, accountId } : null
}

const isNotIamUserButAwsSsoUser = (userName: string) => {
  const awsSsoUserNameRe = new RegExp(
    `^(${AWS_SERVICE_ROLE_FOR_SSO_PREFIX.source}${AWS_IAM_ROLE_NAME_PATTERN.source}|${AWS_IAM_ROLE_NAME_PATTERN.source})/${AWS_SSO_USR_NAME_PATTERN.source}`
  )
  return awsSsoUserNameRe.test(userName)
}

export const patchAccountName = (accountName: Account, multiSessionSupportEnabled: boolean) => {
  const accountMenuButton = selectElement('button[id="nav-usernameMenu"]')
  if (!accountMenuButton) {
    return
  }
  if (multiSessionSupportEnabled) {
    const spans = accountMenuButton?.querySelectorAll<HTMLSpanElement>('span:not(:has(span))')
    // `Account ID:` part varies by language, so use regex to find it
    const accountIdWithoutAliasSpan = Array.from(spans || []).find(span => span.textContent?.match(/\d{4}-\d{4}-\d{4}/));
    if (accountIdWithoutAliasSpan) {
      accountIdWithoutAliasSpan.innerText = `${accountName.accountName} (${accountName.accountId})`
    }
  } else {
    const userName = accountMenuButton?.getAttribute('aria-label')
    const targetSpan = accountMenuButton?.querySelector<HTMLSpanElement>('*[class*="_more-menu__button"] span')
    const title = accountMenuButton?.getAttribute('title')
    if (userName && targetSpan && title && isNotIamUserButAwsSsoUser(title)) {
      targetSpan.innerText = `${userName} @ ${accountName.accountName}`
    } // else not login by user, like root user or IAM role
  }
}

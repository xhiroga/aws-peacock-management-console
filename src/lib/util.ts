import { Account } from "./account-name-repository";
import * as JSONC from 'jsonc-parser'
import yaml from 'js-yaml'
import { ConfigList } from "./config-repository";

export const AWS_IAM_ROLE_NAME_PATTERN = /[\w+=,.@-]+/ // https://docs.aws.amazon.com/IAM/latest/APIReference/API_CreateRole.html

export const parseConfigList = (configList: string) => {
  try {
    return yaml.load(configList) as ConfigList
  } catch {
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

export const patchAccountName = (accountName: Account) => {
  const accountMenuButton = selectElement('button[id="nav-usernameMenu"]')
  if (!accountMenuButton) {
    return
  }
  const spans = accountMenuButton?.querySelectorAll<HTMLSpanElement>('span:not(:has(span))')
  // `Account ID:` part varies by language, so use regex to find it
  const accountIdWithoutAliasSpan = Array.from(spans || []).find(span => span.textContent?.match(/\d{4}-\d{4}-\d{4}/));
  if (accountIdWithoutAliasSpan) {
    accountIdWithoutAliasSpan.innerText = `${accountName.accountName} (${accountName.accountId})`
  }
}

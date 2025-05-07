import { updateAccounts, patchAccountNameIfAwsSso, toAccountNameAndId } from "./util";

test('updateAccounts works', () => {
  const expected = [{
    "accountName": "Dev",
    "accountId": "111111111111"
  }, {
    "accountName": "Prod",
    "accountId": "222222222222"
  }]

  const previous = [{
    "accountName": "Development",
    "accountId": "111111111111"
  }, {
    "accountName": "Prod",
    "accountId": "222222222222"
  }]
  const current = [{
    "accountName": "Dev",
    "accountId": "111111111111"
  }]
  const actual = updateAccounts(previous, current)

  expect(actual).toEqual(expected);
})

test('toAccountNameAndId works', () => {
  const expected = {
    accountName: 'Dev',
    accountId: '123456789012',
  }

  const element = document.createElement('div');
  element.innerHTML = `
<button class="" data-testid="account-list-cell" aria-expanded="false">
  <svg></svg>
  <span>
    <svg>
      <title>AWS Default Icon</title>
      <path></path><path></path><path></path>
    </svg>
  </span>
  <div>
    <div>
      <strong>Dev</strong>
    </div>
    <div>
      <div>123456789012  |  test@example.com</div>
    </div>
  </div>
</button>`;
  const actual = toAccountNameAndId(element.querySelector<HTMLButtonElement>('button') as HTMLButtonElement);

  expect(actual).toEqual(expected);
});

test('patchAccountNameIfAwsSso works: AWS SSO, Account Name', () => {
  const expected = "AWSReadOnlyAccess/hiroga @ Dev"

  document.body.innerHTML = `
<button aria-controls="menu--account" aria-label="AWSReadOnlyAccess/hiroga" aria-expanded="false" data-testid="more-menu__awsc-nav-account-menu-button" id="nav-usernameMenu">
  <span data-testid="awsc-nav-account-menu-button">
      <span title="AWSReservedSSO_AWSReadOnlyAccess_aaaaaaaa00000000/hiroga @ 1234-5678-9012">AWSReadOnlyAccess/hiroga</span>
      <span></span>
  </span>
  <span></span>
</button>`
  patchAccountNameIfAwsSso({ accountId: '123456789012', accountName: 'Dev' }, false)
  const actual = document.querySelector<HTMLSpanElement>('span[title]')?.innerText

  expect(actual).toEqual(expected);
})

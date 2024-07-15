import { getAccountMenuButtonSpan, updateAccounts, patchAccountNameIfAwsSso, toAccountNameAndId } from "./util";

test('updateAccounts works', () => {
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
  const updated = updateAccounts(previous, current)
  const expected = [{
    "accountName": "Dev",
    "accountId": "111111111111"
  }, {
    "accountName": "Prod",
    "accountId": "222222222222"
  }]
  expect(expected).toEqual(updated);
})

test('toAccountNameAndId works', () => {
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

  const account = toAccountNameAndId(element.querySelector<HTMLButtonElement>('button') as HTMLButtonElement);

  expect(account).toEqual({
    accountName: 'Dev',
    accountId: '123456789012',
  });
});

test('patchAccountNameIfAwsSso works: AWS SSO, Account Name', () => {
  document.body.innerHTML = `
<button aria-controls="menu--account" aria-label="AWSReadOnlyAccess/hiroga" aria-expanded="false" data-testid="more-menu__awsc-nav-account-menu-button" id="nav-usernameMenu">
  <span data-testid="awsc-nav-account-menu-button">
      <span title="AWSReservedSSO_AWSReadOnlyAccess_aaaaaaaa00000000/hiroga @ 1234-5678-9012">AWSReadOnlyAccess/hiroga</span>
      <span></span>
  </span>
  <span></span>
</button>`
  patchAccountNameIfAwsSso({ accountId: '123456789012', accountName: 'Dev' })
  const accountMenuButtonSpan = getAccountMenuButtonSpan()
  expect(accountMenuButtonSpan?.innerText).toEqual("AWSReadOnlyAccess/hiroga @ Dev");
})

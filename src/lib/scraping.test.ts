import { getAccountMenuButtonSpan, patchAccountNameIfAwsSso, toAccountNameAndId } from "./scraping";


test('toAccountNameAndId works', () => {
  const element = document.createElement('div');
  element.innerHTML = `
<button class="" data-testid="account-list-cell" aria-expanded="false">
  <svg><path></path></svg>
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
      <span title="AWSReservedSSO_AWSReadOnlyAccess_aaaaaaaa00000000/hiroga @ 1234-5678-9012">
          AWSReadOnlyAccess/hiroga</span>
      <span>
          <svg>
              <path></path>
          </svg>
      </span>
  </span>
  <span>
      <svg>
          <path></path>
      </svg>
  </span>
</button>`
  patchAccountNameIfAwsSso({ accountId: '123456789012', accountName: 'Dev' })
  const accountMenuButtonSpan = getAccountMenuButtonSpan()
  expect(accountMenuButtonSpan?.innerText).toEqual("AWSReadOnlyAccess/hiroga @ Dev");
})

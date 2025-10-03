import { updateAccounts, toAccountNameAndId } from "./util";

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

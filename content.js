const selectElement = (query) => document.querySelectorAll(query)[0];

function getAccountId() {
  return selectElement('[data-testid="aws-my-account-details"]').innerText;
}
function getHeader() {
  return selectElement('[id="awsc-nav-header"]');
}

const getItem = async (key) =>
  new Promise((resolve) => {
    chrome.storage['local'].get(key, resolve);
  });

const loadConfig = async () => {
  const config = (await getItem('config')).config; // ex. '[{"accountId": "123456789012","color": "#377d22"}]'
  return JSON.parse(config);
};

const selectColor = (config, accountId) => {
  return config.find((color) => color.accountId === accountId);
};

const patchColor = (color) => {
  const headerElement = getHeader();
  headerElement.style.backgroundColor = color.color;
};

const run = async () => {
  const config = await loadConfig();
  const accountId = getAccountId();
  const color = selectColor(config, accountId);
  patchColor(color);
};
run();

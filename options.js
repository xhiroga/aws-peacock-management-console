const setItem = async (key, value) =>
  new Promise((resolve, reject) => {
    chrome.storage['local'].set({ [key]: value }, () => {
      const { lastError } = chrome.runtime;
      if (lastError) return reject(lastError);
      console.log('setItem!');
      resolve();
    });
  });

const elById = (id) => {
  return document.getElementById(id);
};

window.onload = () => {
  let saveButton = elById('saveButton');
  let textArea = elById('awsConfigTextArea');

  const onSave = () => {
    const config = textArea.value;
    setItem('config', config);
  };
  saveButton.onclick = onSave;
};

const setItem = async (key: string, value: string) =>
  new Promise((_, reject) => {
    chrome.storage['local'].set({ [key]: value }, () => {
      const { lastError } = chrome.runtime
      if (lastError) return reject(lastError)
    })
  })

const elById = (id: string) => {
  return document.getElementById(id)
}

window.onload = () => {
  const saveButton = elById('saveButton')
  const textArea = <HTMLInputElement>elById('awsConfigTextArea')
  if (saveButton === null || textArea === null) {
    return
  }

  const onSave = () => {
    const config = textArea.value
    setItem('config', config)
  }
  saveButton.onclick = onSave
}

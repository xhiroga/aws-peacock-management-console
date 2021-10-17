import { ConfigRepository } from './lib/config-repository'
import { BrowserStorage } from './lib/browser-storage'

const storage = new BrowserStorage(chrome, 'local')
const configRepository = new ConfigRepository(storage)

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
    configRepository.set(JSON.parse(config))
  }
  saveButton.onclick = onSave
}

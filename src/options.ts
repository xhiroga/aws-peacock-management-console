import { StorageRepository } from './lib/storage'

const storage = new StorageRepository(chrome, 'local')

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
    storage.set('config', JSON.parse(config))
  }
  saveButton.onclick = onSave
}

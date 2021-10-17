import { ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const elById = (id: string) => {
  return document.getElementById(id)
}

window.onload = async () => {
  const saveButton = elById('saveButton')
  const textArea = <HTMLInputElement>elById('awsConfigTextArea')
  if (saveButton === null || textArea === null) {
    return
  }
  textArea.value = JSON.stringify(await configRepository.get())

  const onSave = () => {
    const config = textArea.value
    configRepository.set(JSON.parse(config))
  }
  saveButton.onclick = onSave
}

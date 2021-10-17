import { ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const elById = (id: string) => {
  return document.getElementById(id)
}

window.onload = async () => {
  const textArea = <HTMLInputElement>elById('awsConfigTextArea')
  const saveButton = elById('saveButton')
  if (textArea === null || saveButton === null) {
    return
  }
  textArea.value = await configRepository.get()

  saveButton.onclick = () => configRepository.set(textArea.value)
}

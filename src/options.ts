import { ConfigList, ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

const example: ConfigList = [
  {
    accounts: ['123456789012'],
    style: {
      navigationBackgroundColor: '#2f7c47',
      accountMenuButtonBackgroundColor: '#422c74',
    },
  },
]

window.onload = async () => {
  const textArea = <HTMLInputElement>(
    document.getElementById('awsConfigTextArea')
  )
  const saveButton = document.getElementById('saveButton')
  if (textArea === null || saveButton === null) {
    return
  }
  textArea.value =
    (await configRepository.get()) ?? JSON.stringify(example, null, 2)

  saveButton.onclick = () => configRepository.set(textArea.value)
}

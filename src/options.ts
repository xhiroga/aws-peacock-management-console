import { ConfigRepository } from './lib/config-repository'
import { OptionsRepository } from './lib/options-repository'
import { RepositoryProps } from './types'

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const optionsRepository = new OptionsRepository(repositoryProps)
const configRepository = new ConfigRepository(repositoryProps)

const sampleConfig = `[
  /**
   * JSON with comment format
   *
   * When multiple rules match, the first matching rule will be applied.
   *
   */
  // prod
  {
    "env": {
      "account": "111111111111"
    },
    "style": {
      "navigationBackgroundColor": "#65c89b",
      "accountMenuButtonBackgroundColor": "#945bc4"
    }
  },
  // dev
  {
    // env can be array.
    "env": [
      {
        "account": "222222222222",
        "region": "us-east-1" // region is optional property
      },
      {
        "account": "333333333333"
      }
    ],
    "style": {
      // navigationBackgroundColor and accountMenuButtonBackgroundColor are optional properties.
      "navigationBackgroundColor": "#3399ff",
      "accountMenuButtonBackgroundColor": "#bf0060"
    }
  }
]
`

window.onload = async () => {
  const mode = document.querySelectorAll<HTMLInputElement>('input[name="mode"]');
  const personalConfig = <HTMLDivElement>(document.getElementById('personalConfig'))
  const remoteConfig = <HTMLDivElement>(document.getElementById('remoteConfig'))

  const textArea = <HTMLInputElement>(
    document.getElementById('awsConfigTextArea')
  )
  const sample = <HTMLInputElement>(
    document.getElementById('awsConfigTextAreaSample')
  )
  const saveButton = document.getElementById('saveButton')
  const savedMessage = document.getElementById('savedMessage')
  if (textArea === null || saveButton === null || savedMessage === null) {
    return
  }

  mode.forEach(radioButton => {
    radioButton.onchange = () => {
      if (radioButton.id === "personalMode") {
        personalConfig.hidden = false
        remoteConfig.hidden = true
        optionsRepository.set(JSON.stringify({ mode: 'personal' }))
      } else {
        personalConfig.hidden = true
        remoteConfig.hidden = false
        optionsRepository.set(JSON.stringify({ mode: 'remote' }))
      }
    }
  })

  textArea.value = (await configRepository.get()) ?? sampleConfig
  sample.value = sampleConfig

  saveButton.onclick = () => {
    configRepository.set(textArea.value)
    savedMessage.hidden = false
  }
  textArea.oninput = () => {
    savedMessage.hidden = true
  }
}

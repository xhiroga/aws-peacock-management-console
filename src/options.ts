import { ConfigList, ConfigRepository } from './lib/config-repository'

const configRepository = new ConfigRepository(chrome, 'local')

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
      "account": "111111111111",
      "region": "us-east-1"
    }
    "style": {
      "navigationBackgroundColor": "#d04649",
      "accountMenuButtonBackgroundColor": "#37cb34",
    }
  },

  // dev
  {
    // env can be array.
    "env": [
      {
        "account": "222222222222",
        // region is optional property
      },
      {
        "account": "333333333333",
      }
    ]
    "style": {
      // navigationBackgroundColor and accountMenuButtonBackgroundColor are optional properties.
      "navigationBackgroundColor": "#377d22",
      "accountMenuButtonBackgroundColor": "#422c74",
    }
  }
]
`

window.onload = async () => {
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

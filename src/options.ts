import { ConfigRepository } from './lib/config-repository'
import { RepositoryProps } from './lib/repository'

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
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
      "account": "111111111111",
      "usernamePattern": "AWSReservedSSO_AWSAdministratorAccess_[,-z]+"
    },
    "style": {
      "navigationBackgroundColor": "#57eb81", // green
      "accountMenuButtonBackgroundColor": "#eb5757" // red
    }
  },
  {
      "account": "111111111111",
      // usernamePattern is Optional.
    },
    "style": {
      "navigationBackgroundColor": "#57eb81",
      // accountMenuButtonBackgroundColor and navigationBackgroundColor are both optional properties.
    }

  },
  // dev
  {
    // env can be array.
    "env": [
      {
        "account": "222222222222",
      },
      {
        "account": "333333333333",
        "region": "us-east-1" // region is Optional.
      }
    ],
    "style": {
      "navigationBackgroundColor": "#5763eb",
      "accountMenuButtonBackgroundColor": "#ebcb57"
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

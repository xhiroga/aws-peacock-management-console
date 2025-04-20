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
  },
  // AWS SSO PermissionSet based configuration
  {
    "env": {
      "account": "444444444444",
      "permissionSet": "AdministratorAccess" // permissionSet is optional property
    },
    "style": {
      "navigationBackgroundColor": "#ff5733",
      "accountMenuButtonBackgroundColor": "#33ff57"
    }
  },
  // Multiple PermissionSets in the same account
  {
    "env": [
      {
        "account": "555555555555",
        "permissionSet": "AdministratorAccess"
      },
      {
        "account": "555555555555",
        "permissionSet": "ReadOnlyAccess"
      }
    ],
    "style": {
      "navigationBackgroundColor": "#3357ff",
      "accountMenuButtonBackgroundColor": "#ff33a8"
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

import { ConfigRepository, Environment, Style } from './lib/config-repository'
import { RepositoryProps } from './lib/repository'
import { parseConfigList } from './lib/util'

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
    "env": {
      "account": "111111111111"
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
        "account": "222222222222"
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

const validateConfig = (config: string): string[] => {
  const errors: string[] = []

  let configList
  try {
    configList = parseConfigList(config)
  } catch (e) {
    errors.push(`config file is not a valid JSON or YAML: ${e}`)
    return errors
  }

  if (!Array.isArray(configList)) {
    errors.push('config must be an array')
    return errors
  }

  configList.forEach((configItem, index) => {
    if (configItem.env === undefined) {
      errors.push(`config[${index}].env is not defined`)
      return
    }

    const envs: Environment[] = Array.isArray(configItem.env)
      ? configItem.env
      : [configItem.env]

    envs.forEach((env, envIdx) => {
      if (!/^\d{12}$/.test(String(env.account))) {
        errors.push(
          `config[${index}].env[${envIdx}].account: ${env.account} is not a 12-digit number`
        )
      }

      if (env.usernamePattern !== undefined) {
        try {
          new RegExp(env.usernamePattern)
        } catch (e) {
          errors.push(
            `config[${index}].env[${envIdx}].usernamePattern: ${env.usernamePattern} is not a valid regex: ${e}`
          )
        }
      }
    })

    if (configItem.style === undefined) {
      errors.push(`config[${index}].style is not defined`)
      return
    }

    const colorProps: (keyof Style)[] = [
      'navigationBackgroundColor',
      'accountMenuButtonBackgroundColor',
    ]

    colorProps.forEach((prop) => {
      const value = configItem.style[prop]
      if (value !== undefined && !/^#([0-9a-fA-F]{6})$/.test(value)) {
        errors.push(
          `config[${index}].style.${String(prop)} is not a valid color code`
        )
      }
    })
  })

  return errors
}

window.onload = async () => {
  const textArea = <HTMLInputElement>(
    document.getElementById('awsConfigTextArea')
  )
  const sample = <HTMLInputElement>(
    document.getElementById('awsConfigTextAreaSample')
  )
  const saveButton = document.getElementById('saveButton')
  const savedMessage = document.getElementById('savedMessage')
  const errorMessage = document.getElementById('errorMessage')
  if (textArea === null || saveButton === null || savedMessage === null || errorMessage === null) {
    return
  }
  textArea.value = (await configRepository.get()) ?? sampleConfig
  sample.value = sampleConfig

  saveButton.onclick = () => {
    const errors = validateConfig(textArea.value)
    if (errors.length === 0) {
      configRepository.set(textArea.value)
      savedMessage.hidden = false
      errorMessage.hidden = true
    } else {
      errorMessage.innerHTML = errors.join('\n')
      errorMessage.hidden = false
      savedMessage.hidden = true
    }
  }
  textArea.oninput = () => {
    savedMessage.hidden = true
    errorMessage.hidden = true
  }
}

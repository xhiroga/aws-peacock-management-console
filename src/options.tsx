import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import Form, { IChangeEvent, ISubmitEvent } from '@rjsf/core'
import yaml from 'js-yaml'
import * as JSONC from 'jsonc-parser'

import {
  CONFIG_SCHEMA,
  ConfigList,
  ConfigRepository,
} from './lib/config-repository'
import { RepositoryProps } from './lib/repository'

import 'bootstrap/dist/css/bootstrap.css'

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
  }
]
`

window.onload = async () => {
  const textArea = document.getElementById(
    'awsConfigTextArea'
  ) as HTMLInputElement
  const sample = document.getElementById(
    'awsConfigTextAreaSample'
  ) as HTMLInputElement
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

interface OptionsAppProps {
  readonly configRepository: ConfigRepository
  readonly initialConfig: ConfigList
}

export const OptionsApp = ({
  configRepository,
  initialConfig,
}: OptionsAppProps) => {
  const [config, setConfig] = React.useState(initialConfig)
  const handleChange = (e: IChangeEvent<ConfigList>) => {
    setConfig(e.formData)
  }
  const handleSubmit = (e: ISubmitEvent<ConfigList>) => {
    configRepository.set(JSON.stringify(e.formData, null, 2))
  }
  return (
    <Form
      schema={CONFIG_SCHEMA}
      formData={config}
      onChange={handleChange}
      onSubmit={handleSubmit}
    ></Form>
  )
}

export const parseConfigList = (configListString: string) => {
  try {
    return yaml.load(configListString) as ConfigList
  } catch (e) {
    return JSONC.parse(configListString) as ConfigList
  }
}

export const normalizeConfigList = (configList: ConfigList) =>
  configList.map((config) => {
    const env = Array.isArray(config.env) ? config.env : Array(config.env)
    return { ...config, env }
  })

configRepository.get().then((configList) => {
  const config = normalizeConfigList(
    parseConfigList(configList ?? sampleConfig)
  )
  const rootElement = document.getElementById('app')
  if (rootElement === null) {
    throw new Error('The root element was not found!')
  }
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <OptionsApp configRepository={configRepository} initialConfig={config} />
  )
})

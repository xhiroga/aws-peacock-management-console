import { OptionsRepository } from './lib/options-repository'
import { PersonalConfigRepository } from './lib/personal-config-repository'
import { RemoteConfigRepository } from './lib/remote-config-repository'
import { RemoteConfigUrlRepository } from './lib/remote-config-url-repository'

const optionsRepository = new OptionsRepository()
const personalConfigRepository = new PersonalConfigRepository()
const remoteConfigRepository = new RemoteConfigRepository()
const remoteConfigUrlRepository = new RemoteConfigUrlRepository()

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

const fetchData = async (url: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

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

  const remoteConfigUrl = <HTMLInputElement>(
    document.getElementById('remoteConfigUrl')
  )
  const remoteConfigTextArea = <HTMLInputElement>(
    document.getElementById('remoteConfigTextArea')
  )
  const remoteConfigSaveButton = document.getElementById('remoteConfigSaveButton')
  if (!textArea || !saveButton || !savedMessage || !remoteConfigUrl || !remoteConfigSaveButton || !remoteConfigTextArea) {
    return;
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

  textArea.value = (await personalConfigRepository.get()) ?? sampleConfig
  sample.value = sampleConfig

  saveButton.onclick = () => {
    personalConfigRepository.set(textArea.value)
    savedMessage.hidden = false
  }
  textArea.oninput = () => {
    savedMessage.hidden = true
  }

  remoteConfigUrl.value = JSON.parse(await remoteConfigUrlRepository.get()).url
  remoteConfigTextArea.value = await remoteConfigRepository.get()

  remoteConfigSaveButton.onclick = async () => {
    const url = remoteConfigUrl.value
    remoteConfigUrlRepository.set(JSON.stringify({ url }))

    // TODO: Error handling
    const text = await fetchData(url)
    console.log(text)
    if (!text) { return }
    remoteConfigTextArea.value = text
    remoteConfigRepository.set(text)
  }
}

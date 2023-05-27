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

const fetchData = async (url: string, username?: string, password?: string): Promise<string | undefined> => {
  console.log({ url, username, password })
  try {
    const headers: Record<string, string> = username && password ? {
      'Authorization': 'Basic ' + btoa(username + ":" + password)
    } : {};

    const response = await fetch(url, { headers });
    return await response.text();
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

window.onload = async () => {
  // Mode
  const personalMode = document.querySelector<HTMLInputElement>('input[name="mode"][value="personal"]');
  const remoteMode = document.querySelector<HTMLInputElement>('input[name="mode"][value="remote"]');

  // Personal
  const personalConfig = <HTMLDivElement>(document.getElementById('personalConfig'))
  const textArea = <HTMLInputElement>(
    document.getElementById('personalConfigTextArea')
  )

  // Remote
  const remoteConfig = <HTMLDivElement>(document.getElementById('remoteConfig'))
  const remoteConfigUrl = <HTMLInputElement>(
    document.getElementById('remoteConfigUrl')
  )
  const remoteConfigUsername = <HTMLInputElement>(
    document.getElementById('remoteConfigUsername')
  )
  const remoteConfigPassword = <HTMLInputElement>(
    document.getElementById('remoteConfigPassword')
  )
  const remoteConfigSaveButton = document.getElementById('remoteConfigSaveButton')
  const remoteConfigTextArea = <HTMLInputElement>(
    document.getElementById('remoteConfigTextArea')
  )

  if (!personalMode || !remoteMode || !personalConfig || !textArea || !remoteConfig || !remoteConfigUrl || !remoteConfigSaveButton || !remoteConfigTextArea) {
    return;
  }

  // Mode
  const showPersonalConfig = () => {
    personalConfig.hidden = false
    remoteConfig.hidden = true
  }
  const showRemoteConfig = () => {
    personalConfig.hidden = true
    remoteConfig.hidden = false
  }
  const options = JSON.parse(await optionsRepository.get() || "{}")
  if (options.mode === "personal") {
    personalMode.checked = true
    showPersonalConfig()
  } else if (options.mode === "remote") {
    remoteMode.checked = true
    showRemoteConfig()
  }

  personalMode.onchange = () => {
    showPersonalConfig()
    optionsRepository.set(JSON.stringify({ mode: "personal" }))
  }
  remoteMode.onchange = () => {
    showRemoteConfig()
    optionsRepository.set(JSON.stringify({ mode: "remote" }))
  }

  // Personal
  textArea.value = (await personalConfigRepository.get()) ?? sampleConfig

  textArea.oninput = () => {
    personalConfigRepository.set(textArea.value)
  }

  // Remote
  const { url, username, password } = JSON.parse(await remoteConfigUrlRepository.get() || "{}")
  url && (remoteConfigUrl.value = url)
  username && (remoteConfigUsername.value = username)
  password && (remoteConfigPassword.value = password)
  remoteConfigTextArea.value = await remoteConfigRepository.get() || ""

  remoteConfigSaveButton.onclick = async () => {
    const url = remoteConfigUrl.value
    const username = remoteConfigUsername.value
    const password = remoteConfigPassword.value
    remoteConfigUrlRepository.set(JSON.stringify({ url, username, password }))

    // TODO: Error handling
    const text = await fetchData(url, username, password)
    console.log(text)
    if (!text) { return }
    remoteConfigTextArea.value = text
    remoteConfigRepository.set(text)
  }
}

import { Browser, BrowserStorage, StorageArea } from './browser-storage'

export type Environment = {
  account: string
  region?: string
}
export type Config = {
  env: Environment | Environment[]
  style: {
    navigationBackgroundColor?: string
    accountMenuButtonBackgroundColor?: string
  }
}
export type ConfigList = Config[]

export class ConfigRepository {
  key = 'config'
  storage: BrowserStorage<string>
  constructor(browser: Browser, storageArea: StorageArea) {
    this.storage = new BrowserStorage<string>(browser, storageArea)
  }

  get = async (): Promise<string> => {
    return this.storage.get(this.key)
  }

  set = async (value: string): Promise<void> => {
    return this.storage.set(this.key, value)
  }
}

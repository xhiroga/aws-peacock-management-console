import { Browser, BrowserStorage, StorageArea } from './browser-storage'

export type Config = {
  accounts?: string[]
  regions?: string[]
  color: string
}
export type ConfigList = Config[]

export class ConfigRepository {
  key = 'config'
  storage: BrowserStorage<ConfigList>
  constructor(browser: Browser, storageArea: StorageArea) {
    this.storage = new BrowserStorage<ConfigList>(browser, storageArea)
  }

  get = async (): Promise<ConfigList> => {
    return this.storage.get(this.key)
  }

  set = async (value: ConfigList): Promise<void> => {
    return this.storage.set(this.key, value)
  }
}

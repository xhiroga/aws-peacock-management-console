import { BrowserStorage } from './browser-storage'

export type Config = {
  accounts?: string[]
  regions?: string[]
  color: string
}
export type ConfigList = Config[]

export class ConfigRepository {
  key = 'config'
  storage: BrowserStorage
  constructor(storage: BrowserStorage) {
    this.storage = storage
  }

  get = async (): Promise<ConfigList> => {
    return this.storage.get<ConfigList>(this.key)
  }

  set = async (value: ConfigList): Promise<void> => {
    return this.storage.set(this.key, value)
  }
}

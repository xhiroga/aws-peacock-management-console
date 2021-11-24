import { BrowserStorage, Browser, StorageArea } from './browser-storage'

export type RepositoryProps = {
  browser: Browser
  storageArea: StorageArea
}
export class Repository {
  storage: BrowserStorage<string>
  key: string

  constructor(key: string, props: RepositoryProps) {
    const { browser, storageArea } = props
    this.storage = new BrowserStorage<string>(browser, storageArea)
    this.key = key
  }

  get = async (): Promise<string> => {
    return this.storage.get(this.key)
  }

  set = async (value: string): Promise<void> => {
    return this.storage.set(this.key, value)
  }
}

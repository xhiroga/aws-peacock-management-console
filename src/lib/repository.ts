import { RepositoryProps } from '../types'
import { BrowserStorage } from './browser-storage'

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}

export class Repository {
  storage: BrowserStorage<string>
  key: string

  constructor(key: string, props: RepositoryProps = repositoryProps) {
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

type StorageArea = 'local' | 'sync'
type Item<T> = { [key: string]: T }

export class StorageRepository {
  runtime: typeof chrome.runtime
  storageArea: chrome.storage.LocalStorageArea | chrome.storage.SyncStorageArea
  constructor(browser: typeof chrome, storageArea: StorageArea) {
    this.runtime = browser.runtime
    this.storageArea = browser.storage[storageArea]
  }

  get = async <T>(key: string): Promise<Item<T>> => {
    return new Promise((resolve) => {
      this.storageArea.get(key, resolve)
    })
  }

  set = async (key: string, value: any): Promise<void> => {
    return new Promise((_, reject) => {
      this.storageArea.set({ [key]: value }, () => {
        const { lastError } = this.runtime
        if (lastError) return reject(lastError)
      })
    })
  }
}

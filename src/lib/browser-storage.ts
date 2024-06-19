import { Browser, StorageArea } from "../types"

export class BrowserStorage<T> {
  runtime: typeof chrome.runtime

  storageArea: chrome.storage.LocalStorageArea | chrome.storage.SyncStorageArea

  constructor(browser: Browser, storageArea: StorageArea) {
    this.runtime = browser.runtime
    this.storageArea = browser.storage[storageArea]
  }

  get = async (key: string): Promise<T> => {
    return new Promise((resolve) => {
      this.storageArea.get(key, (item) => resolve(item[key]))
    })
  }

  set = async (key: string, value: T): Promise<void> => {
    return new Promise((_, reject) => {
      this.storageArea.set({ [key]: value }, () => {
        const { lastError } = this.runtime
        if (lastError) return reject(lastError)
      })
    })
  }
}

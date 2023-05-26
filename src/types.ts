export type AccountName = {
    accountName: string
    accountId: string
}

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

export type Browser = typeof chrome

export type StorageArea = 'local' | 'sync'

export type RepositoryProps = {
    browser: Browser
    storageArea: StorageArea
}

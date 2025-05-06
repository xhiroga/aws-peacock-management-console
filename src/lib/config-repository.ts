import { Repository, RepositoryProps } from './repository'

export type Environment = {
  account: string
  region?: string
  usernamePattern?: string
}
export type Config = {
  env: Environment | Environment[]
  style: {
    navigationBackgroundColor?: string
    accountMenuButtonBackgroundColor?: string
  }
}
export type ConfigList = Config[]

export class ConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('config', props)
  }
}

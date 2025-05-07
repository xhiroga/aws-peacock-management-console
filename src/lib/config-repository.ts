import { Repository, RepositoryProps } from './repository'

export type Environment = {
  account: string
  region?: string
  usernamePattern?: string
}
export type Style = {
  navigationBackgroundColor?: string
  accountMenuButtonBackgroundColor?: string
}
export type Config = {
  env: Environment | Environment[]
  style: Style
}
export type ConfigList = Config[]

export class ConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('config', props)
  }
}

import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class ConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('config', props)
  }
}

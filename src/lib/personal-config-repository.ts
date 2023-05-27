import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class PersonalConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    // In versions prior to v2, there was no remote mode, so the configuration was simply stored as 'config'
    super('config', props)
  }
}

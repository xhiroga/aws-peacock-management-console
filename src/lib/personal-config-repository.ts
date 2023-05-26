import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class PersonalConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('config', props)
  }
}

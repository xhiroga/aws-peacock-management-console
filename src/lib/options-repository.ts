import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class OptionsRepository extends Repository {
  constructor(props?: RepositoryProps) {
    super('options', props)
  }
}

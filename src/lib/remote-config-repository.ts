import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class RemoteConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('remote-config', props)
  }
}

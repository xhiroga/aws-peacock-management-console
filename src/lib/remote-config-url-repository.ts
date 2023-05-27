import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class RemoteConfigUrlRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('remote-config-url', props)
  }
}

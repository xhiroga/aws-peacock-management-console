import { RepositoryProps } from '../types'
import { Repository } from './repository'

export class AccountNameRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('account-name', props)
  }
}

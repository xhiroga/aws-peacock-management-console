import { JSONSchema7 } from 'json-schema'

import { Repository, RepositoryProps } from './repository'

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

export class ConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('config', props)
  }
}

export const CONFIG_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  items: {
    type: 'object',
    required: ['env'],
    properties: {
      env: {
        title: 'Environment',
        type: 'array',
        items: {
          type: 'object',
          required: ['account'],
          properties: {
            account: {
              title: 'Account',
              type: 'string',
              pattern: '^\\d{12}$',
            },
            region: {
              title: 'Region',
              type: 'string',
            },
          },
        },
      },
      style: {
        title: 'Style',
        type: 'object',
        properties: {
          navigationBackgroundColor: {
            title: 'Navigation Background Color',
            type: 'string',
          },
          accountMenuButtonBackgroundColor: {
            title: 'Account Menu Button Color',
            type: 'string',
          },
        },
      },
    },
  },
  definitions: {
    env: {
      type: 'object',
      required: ['account'],
      properties: {
        account: {
          title: 'Account',
          type: 'string',
          pattern: '^\\d{12}$',
        },
        region: {
          title: 'Region',
          type: 'string',
        },
      },
    },
  },
}

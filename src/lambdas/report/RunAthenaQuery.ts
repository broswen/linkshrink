'use strict'

import logger from '../../logging/Logger'

import { AthenaClient, StartQueryExecutionCommand, StartQueryExecutionCommandInput, StartQueryExecutionCommandOutput } from '@aws-sdk/client-athena'

const athenaClient: AthenaClient = new AthenaClient({})

async function handler(event: { type: string, prefix: string }) {
  logger.info(event)

  let startQueryExecutionInput: StartQueryExecutionCommandInput = {
    QueryString: '',
    ResultConfiguration: {
      OutputLocation: `s3://${process.env.REPORTSBUCKET}/${event.prefix}`
    }
  }

  switch (event.type) {
    case 'month':
      break;

    case 'week':
      break;

    case 'all':
      await athenaClient.send(new StartQueryExecutionCommand(startQueryExecutionInput))
      break;

    default:
      logger.info('query type not found', event)
      break;
  }


}

module.exports = { handler }

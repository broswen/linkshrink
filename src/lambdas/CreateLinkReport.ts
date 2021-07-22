'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import logger from '../logging/Logger'
import LinkService from '../services/LinkService'
import { Link } from '../models/Link'
import { SFNClient, StartExecutionCommand, StartExecutionCommandInput } from '@aws-sdk/client-sfn'
const middy = require('@middy/core')

const validator = require('@middy/validator')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')


const ddbClient: DynamoDBClient = new DynamoDBClient({})
const sfnClient: SFNClient = new SFNClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function createLinkReport(event): Promise<APIGatewayProxyResult> {
  let key: string = event.requestContext.identity.apiKeyId

  const start: Date = new Date(event.body.start)
  const stop: Date = new Date(event.body.stop)

  let link: Link = await linkService.getLink(event.pathParameters.slug)

  let reportKey: string = await linkService.createLinkReport(event.pathParameters.slug, start, stop)

  const startExecutionInput: StartExecutionCommandInput = {
    stateMachineArn: process.env.GENERATEREPORTSM,
    input: JSON.stringify({ slug: link.slug, reportKey })
  }

  await sfnClient.send(new StartExecutionCommand(startExecutionInput))

  return {
    statusCode: 200,
    body: JSON.stringify({
      reportKey
    })
  }
}

const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        start: { type: 'string', format: 'date-time' },
        stop: { type: 'string', format: 'date-time' }
      },
      required: ['start', 'stop']
    },
    pathParameters: {
      type: 'object',
      properties: {
        slug: { type: 'string' }
      },
      required: ['slug']
    }
  },
  required: ['body', 'pathParameters']
}

const handler = middy(createLinkReport)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: schema }))
  .use(httpErrorHandler())

module.exports = { handler }

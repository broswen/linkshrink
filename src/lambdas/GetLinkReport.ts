'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import logger from '../logging/Logger'
import LinkService from '../services/LinkService'
import { Link } from '../models/Link'
import { LinkReport } from '../models/LinkReport'
const middy = require('@middy/core')

const validator = require('@middy/validator')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')


const ddbClient: DynamoDBClient = new DynamoDBClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function getLinkReport(event): Promise<APIGatewayProxyResult> {
  let key: string = event.requestContext.identity.apiKeyId

  let linkReport: LinkReport = await linkService.getLinkReport(event.pathParameters.slug, event.pathParameters.reportkey)

  return {
    statusCode: 200,
    body: JSON.stringify(linkReport)
  }
}

const schema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        reportkey: { type: 'string' }
      },
      required: ['slug', 'reportkey']
    }
  },
  required: ['pathParameters']
}

const handler = middy(getLinkReport)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: schema }))
  .use(httpErrorHandler())

module.exports = { handler }

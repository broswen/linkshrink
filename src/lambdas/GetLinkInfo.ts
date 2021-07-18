'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import logger from '../logging/Logger'
import { Link } from '../models/Link'
import LinkService from '../services/LinkService'
const middy = require('@middy/core')

const validator = require('@middy/validator')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')

const ddbClient: DynamoDBClient = new DynamoDBClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function getLinkInfo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let link: Link
  try {
    link = await linkService.getLink(event.pathParameters.slug)
  } catch (error) {
    logger.error(error)
    throw new createError(404)
  }
  logger.info(event)

  return {
    statusCode: 200,
    body: JSON.stringify(link)
  }
}

const schema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
      },
      required: ['slug']
    },
  },
  required: ['pathParameters']
}

const handler = middy(getLinkInfo)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: schema }))
  .use(httpErrorHandler())

module.exports = { handler }

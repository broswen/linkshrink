'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import logger from '../logging/Logger'
import LinkService from '../services/LinkService'
import { Link } from '../models/Link'
const middy = require('@middy/core')

const validator = require('@middy/validator')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')


const ddbClient: DynamoDBClient = new DynamoDBClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function createLink(event): Promise<APIGatewayProxyResult> {
  let key: string = event.requestContext.identity.apiKeyId
  logger.info(event)

  const expires: Date = new Date(event.body.expires)

  let createdLink: Link = await linkService.createLink(key, event.body.link, event.body.clicks, expires)

  return {
    statusCode: 200,
    body: JSON.stringify({
      slug: createdLink.slug
    })
  }
}

const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        link: { type: 'string' },
        expires: { type: 'string' },
        clicks: { type: 'boolean' }
      },
      required: ['link', 'expires', 'clicks']
    },
  },
  required: ['body']
}

const handler = middy(createLink)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: schema }))
  .use(httpErrorHandler())

module.exports = { handler }

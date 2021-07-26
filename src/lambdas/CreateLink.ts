'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyResult } from 'aws-lambda'
import { create } from 'domain'
import LinkAlreadyExistsError from '../errors/LinkAlreadyExistsError'
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

async function createLink(event: any): Promise<APIGatewayProxyResult> {
  let key: string = event.requestContext.identity.apiKeyId

  const expires: Date = new Date(event.body.expires)
  let createdLink: Link
  try {
    if (event.body.slug) {
      createdLink = await linkService.createLink(key, event.body.link, event.body.clicks, expires, event.body.slug)
    } else {
      createdLink = await linkService.createLink(key, event.body.link, event.body.clicks, expires)
    }

  } catch (error) {
    logger.error(error)
    if (error instanceof LinkAlreadyExistsError) {
      throw createError(400)
    }
    throw createError(500)
  }

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
        expires: { type: 'string', format: 'date-time' },
        clicks: { type: 'boolean' },
        slug: { type: 'string', minLength: 1 }
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

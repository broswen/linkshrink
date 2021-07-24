'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { KinesisClient, PutRecordCommand, PutRecordCommandInput } from '@aws-sdk/client-kinesis'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import LinkNotFoundError from '../errors/LinkNotFoundError'
import logger from '../logging/Logger'
import { Link } from '../models/Link'
import LinkService from '../services/LinkService'
const middy = require('@middy/core')

const validator = require('@middy/validator')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')

const ddbClient: DynamoDBClient = new DynamoDBClient({})
const kinesisClient: KinesisClient = new KinesisClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function getLink(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let link: Link
  try {
    link = await linkService.getLink(event.pathParameters.slug)
  } catch (error) {
    logger.error(error)
    if (error instanceof LinkNotFoundError) {
      throw createError(404)
    }
    throw createError(500)
  }

  if (new Date() > link.expires) {
    logger.info(`${link.slug} has expired`)
    throw new createError(404)
  }

  if (link.clicks) {
    const putRecordInput: PutRecordCommandInput = {
      StreamName: process.env.CLICKEVENTSSTREAM,
      PartitionKey: link.slug,
      Data: Buffer.from(JSON.stringify({
        slug: link.slug,
        key: link.key,
        timestamp: new Date().toISOString(),
        ip: event.requestContext.identity.sourceIp,
        lang: event.headers['Accept-Language'],
        useragent: event.headers['User-Agent']
      }))
    }
    await kinesisClient.send(new PutRecordCommand(putRecordInput))
  }

  return {
    statusCode: 301,
    headers: {
      Location: link.link
    },
    body: JSON.stringify({})
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

const handler = middy(getLink)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: schema }))
  .use(httpErrorHandler())

module.exports = { handler }

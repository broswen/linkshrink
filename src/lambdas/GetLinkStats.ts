'use strict'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Sequelize } from 'sequelize'
import logger from '../logging/Logger'
import { ClickEvent } from '../models/ClickEvent'
import { getRDSSecret, RDSSecret } from '../secrets/GetSecret'
const middy = require('@middy/core')

const validator = require('@middy/validator')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')

let sequelize: Sequelize

async function getLinkStats(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

  logger.info(event)
  const secret: RDSSecret = await getRDSSecret(process.env.DBSECRET!)
  try {
    sequelize = new Sequelize(`postgres://${secret.username}:${secret.password}@${secret.host}:${secret.port}/linkshrink`)
    await sequelize.authenticate();
  } catch (error) {
    logger.error(error)
    throw createError(500)
  }
  const clickevent = ClickEvent(sequelize)

  const count: number = await clickevent.count({ where: { slug: event.pathParameters.slug } })

  return {
    statusCode: 200,
    body: JSON.stringify({
      slug: event.pathParameters.slug,
      count
    })
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

const handler = middy(getLinkStats)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: schema }))
  .use(httpErrorHandler())

module.exports = { handler }

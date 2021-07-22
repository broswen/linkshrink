'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyResult } from 'aws-lambda'
import logger from '../../logging/Logger'
import { LinkReport, LinkReportEvent } from '../../models/LinkReport'
import LinkService from '../../services/LinkService'
const middy = require('@middy/core')

const validator = require('@middy/validator')


const ddbClient: DynamoDBClient = new DynamoDBClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function startReport(event: LinkReportEvent) {
  logger.info(event)

  let linkReport: LinkReport = await linkService.getLinkReport(event.slug, event.reportKey)

  linkService.setLinkReportStatus(linkReport.slug, linkReport.reportKey, 'PROCESSING')
}

const schema = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    reportKey: { type: 'string' }
  },
  required: ['slug', 'reportKey']
}

const handler = middy(startReport)
  .use(validator({ inputSchema: schema }))

module.exports = { handler }

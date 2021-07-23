'use strict'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Op, Sequelize } from 'sequelize'
import { ClickEvent, ClickEventModel } from '../../models/ClickEvent'
import logger from '../../logging/Logger'
import { LinkReport, LinkReportEvent } from '../../models/LinkReport'
import { getRDSSecret, RDSSecret } from '../../secrets/GetSecret'
import LinkService from '../../services/LinkService'
const middy = require('@middy/core')

const validator = require('@middy/validator')

let sequelize: Sequelize
const ddbClient: DynamoDBClient = new DynamoDBClient({})
const linkService: LinkService = new LinkService(ddbClient)

async function generateReport(event: LinkReportEvent) {
  logger.info(event)

  const linkReport: LinkReport = await linkService.getLinkReport(event.slug, event.reportKey)

  const secret: RDSSecret = await getRDSSecret(process.env.DBSECRET!)
  try {
    sequelize = new Sequelize(`postgres://${secret.username}:${secret.password}@${secret.host}:${secret.port}/linkshrink`)
    await sequelize.authenticate();
  } catch (error) {
    throw error
  }
  const clickevent = ClickEvent(sequelize)
  const events = await clickevent.findAll({
    where: {
      timestamp: {
        [Op.and]: {
          [Op.lt]: linkReport.stop,
          [Op.gt]: linkReport.start
        }
      }
    }
  })

  logger.info(events.length)
  logger.info(events.map(event => event.toJSON()))

  logger.info(`generating report for ${event.slug} ${event.reportKey}`)

  // TODO convert click event objects into csv data and save to s3 with reportKey

}

const schema = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    reportKey: { type: 'string' }
  },
  required: ['slug', 'reportKey']
}

const handler = middy(generateReport)
  .use(validator({ inputSchema: schema }))

module.exports = { handler }

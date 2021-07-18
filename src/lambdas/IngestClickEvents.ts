'use strict'

import { KinesisStreamEvent } from 'aws-lambda'
import { Sequelize } from 'sequelize'
import logger from '../logging/Logger'
import { ClickEvent, ClickEventAttributes, ClickEventCreationAttributes } from '../models/ClickEvent'
import { getRDSSecret, RDSSecret } from '../secrets/GetSecret'
const createError = require('http-errors')

let sequelize: Sequelize

async function handler(event: KinesisStreamEvent) {

  const secret: RDSSecret = await getRDSSecret(process.env.DBSECRET!)
  try {
    sequelize = new Sequelize(`postgres://${secret.username}:${secret.password}@${secret.host}:${secret.port}/linkshrink`)
    await sequelize.authenticate();
  } catch (error) {
    logger.error(error)
    throw createError(500)
  }
  const clickevent = ClickEvent(sequelize)

  let clickEvents: ClickEventCreationAttributes[] = []
  for (let record of event.Records) {
    let b64Data: string = Buffer.from(record.kinesis.data, 'base64').toString()
    let clickEvent: ClickEventAttributes = JSON.parse(b64Data)
    clickEvents.push(clickEvent)
  }
  logger.info(clickEvents)
  await clickevent.bulkCreate(clickEvents)
  // TODO sequelize bulkCreate

  return
}

module.exports = { handler }

'use strict'

import { FirehoseTransformationEvent } from "aws-lambda"
import logger from "../logging/Logger"


async function handler(event: FirehoseTransformationEvent) {
    logger.info(event)
    const output = event.records.map(record => {
        // append newline to json records to athena can easily parse from s3 logs
        const oldData = Buffer.from(record.data, 'base64').toString() + '\n'
        const newData = Buffer.from(oldData).toString('base64')

        return {
            recordId: record.recordId,
            approximateArrivalTimestamp: record.approximateArrivalTimestamp,
            result: 'Ok',
            kinesisRecordMetadata: record.kinesisRecordMetadata,
            data: newData
        }
    })

    return { records: output }
}

module.exports = { handler }

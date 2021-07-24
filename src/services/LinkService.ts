'use strict'

import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb'
import { Link } from '../models/Link'

const KSUID = require('ksuid')

export default class LinkService {

    ddbClient: DynamoDBClient

    constructor(ddbClient: DynamoDBClient) {
        this.ddbClient = ddbClient
    }

    async getLink(slug: string): Promise<Link> {
        const getItemInput: GetItemCommandInput = {
            Key: {
                slug: {
                    S: slug
                }
            },
            TableName: process.env.LINKSTABLE
        }
        let getItemResponse: GetItemCommandOutput = await this.ddbClient.send(new GetItemCommand(getItemInput))

        if (getItemResponse.Item == undefined) {
            throw new Error('Link not found')
        }

        let link: Link = {
            slug: getItemResponse.Item.slug.S,
            link: getItemResponse.Item.link.S,
            key: getItemResponse.Item.key.S,
            clicks: getItemResponse.Item.clicks.BOOL,
            expires: new Date(getItemResponse.Item.expires.S),
            created: new Date(getItemResponse.Item.created.S)
        }

        return link
    }

    async createLink(key: string, link: string, clicks: boolean, expires: Date): Promise<Link> {
        let slug: string = (await KSUID.random()).string;

        let createdLink: Link = {
            link,
            key,
            clicks,
            slug,
            expires,
            created: new Date()
        }

        const putItemInput: PutItemCommandInput = {
            TableName: process.env.LINKSTABLE,
            Item: {
                slug: {
                    S: createdLink.slug
                },
                link: {
                    S: createdLink.link
                },
                key: {
                    S: createdLink.key
                },
                clicks: {
                    BOOL: createdLink.clicks
                },
                expires: {
                    S: createdLink.expires.toISOString()
                },
                created: {
                    S: createdLink.created.toISOString()
                }

            },
            ConditionExpression: 'attribute_not_exists(PK)'
        }

        let putItemResponse: PutItemCommandOutput = await this.ddbClient.send(new PutItemCommand(putItemInput))

        return createdLink

    }

}

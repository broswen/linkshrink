'use strict'

import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb'
import LinkAlreadyExistsError from '../errors/LinkAlreadyExistsError'
import LinkNotFoundError from '../errors/LinkNotFoundError'
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

        let getItemResponse: GetItemCommandOutput
        try {
            getItemResponse = await this.ddbClient.send(new GetItemCommand(getItemInput))
        } catch (error) {
            throw error
        }

        if (getItemResponse.Item === undefined) {
            throw new LinkNotFoundError(slug)
        }

        let link: Link = {
            slug: getItemResponse.Item.slug.S!,
            link: getItemResponse.Item.link.S!,
            key: getItemResponse.Item.key.S!,
            clicks: getItemResponse.Item.clicks.BOOL!,
            expires: new Date(getItemResponse.Item.expires.S!),
            created: new Date(getItemResponse.Item.created.S!)
        }

        return link
    }

    async createLink(key: string, link: string, clicks: boolean, expires: Date, slug?: string): Promise<Link> {
        if (slug === undefined) {
            slug = (await KSUID.random()).string;
        }

        let createdLink: Link = {
            link,
            key,
            clicks,
            slug: slug!,
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
            ConditionExpression: 'attribute_not_exists(slug)'
        }
        let putItemResponse: PutItemCommandOutput
        try {
            putItemResponse = await this.ddbClient.send(new PutItemCommand(putItemInput))
        } catch (error) {
            if (error.name === 'ConditionalCheckFailedException') {
                throw new LinkAlreadyExistsError(createdLink.slug)
            }
            throw error
        }

        return createdLink

    }

}

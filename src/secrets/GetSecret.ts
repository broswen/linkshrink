

import { GetSecretValueCommand, GetSecretValueCommandInput, GetSecretValueCommandOutput, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import logger from '../logging/Logger'
const smClient: SecretsManagerClient = new SecretsManagerClient({})

interface RDSSecret {
    username: string
    password: string
    engine: string
    host: string
    port: number
    dbInstanceIdentifier: string
}

let secret: RDSSecret

async function getRDSSecret(secretArn: string): Promise<RDSSecret> {
    if (secret != null) {
        logger.info('secret in cache')
        return secret
    }

    if (process.env.STAGE === 'local') {
        logger.info('returning local secret')
        secret = {
            username: 'postgres',
            password: 'password',
            engine: 'postgres',
            host: 'localhost',
            port: 5432,
            dbInstanceIdentifier: 'localhost'
        }
        return secret
    }

    const getSecretInput: GetSecretValueCommandInput = {
        SecretId: process.env.DBSECRET
    }
    logger.info(`get secret ${secretArn}`)
    const getSecretResponse: GetSecretValueCommandOutput = await smClient.send(new GetSecretValueCommand(getSecretInput))
    if (getSecretResponse.SecretString == null) {
        throw new Error(`SecretString is null for ${secretArn}`)
    }

    try {
        secret = JSON.parse(getSecretResponse.SecretString!)
    } catch (error) {
        throw new Error(`unable to parse SecretString for ${secretArn}`)
    }

    return secret
}

export { getRDSSecret, RDSSecret }
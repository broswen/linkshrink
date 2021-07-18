'use strict'
import { DataTypes, Model, ModelDefined, Optional, Sequelize } from 'sequelize'
interface ClickEventAttributes {
    id: number
    slug: string
    key: string
    timestamp: Date
    host: string
    lang: string
    useragent: string
}


interface ClickEventCreationAttributes extends Optional<ClickEventAttributes, 'id'> { }

interface ClickEventModel extends Model<ClickEventAttributes, ClickEventCreationAttributes>, ClickEventAttributes {
    id: number
    slug: string
    key: string
    timestamp: Date
    ip: string
    lang: string
    useragent: string
}

const ClickEvent = function (sequelize: Sequelize): ModelDefined<ClickEventAttributes, ClickEventCreationAttributes> {
    return sequelize.define(
        'RunDate',
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            slug: {
                type: DataTypes.TEXT,
                field: 'slug'
            },
            key: {
                type: DataTypes.TEXT,
                field: 'key'
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'timestamp'
            },
            ip: {
                type: DataTypes.TEXT,
                field: 'ip'
            },
            lang: {
                type: DataTypes.TEXT,
                field: 'lang'
            },
            useragent: {
                type: DataTypes.TEXT,
                field: 'useragent'
            }
        }, {
        createdAt: false,
        updatedAt: false,
        tableName: 'clickevents'
    })
}

export { ClickEventModel, ClickEvent, ClickEventAttributes, ClickEventCreationAttributes }

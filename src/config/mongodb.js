import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

let officeHubDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()
  officeHubDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

export const GET_DB = () => {
  if (!officeHubDatabaseInstance) throw new Error('Must connect database first!')
  return officeHubDatabaseInstance
}


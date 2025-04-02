/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  //Enable req.body json data
  app.use(express.json())

  //use API v1
  app.use('/v1', APIs_V1)

  //middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  //cleanup trước khi dừng server
  exitHook(() => {
    console.log('Disconnected to Mongo Cloud Atlas')
    CLOSE_DB()
  })
}

//Connect database before run server
(async () => {
  try {
    console.log('Connecting to Mongo Cloud Atlas')
    await CONNECT_DB()
    console.log('Connected to Mongo Cloud Atlas')

    //Start run server
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()


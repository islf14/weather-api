import axios from 'axios'
import express from 'express'
import { createClient } from 'redis'

const app = express()
const port = 4000

// url: 'redis://:@redis:6379' // for compose
// url: 'redis://:@127.0.0.1:6378' // run image redis (redis1) // from npm start
// url: 'redis://:@redis1:6379' // run image redis (redis1) // build and run dockerfile

const client = await createClient({
  url: 'redis://:@127.0.0.1:6378'
})
  .on('error', (err) => console.log('Redis Client Error', err))
  .connect()

app.get('/', (req, res) => {
  res.json('Server listening, please enter param /location')
})

app.get('/:name', async (req, res) => {
  const { name } = req.params
  if (name) {
    const data = await client.get(name)
    if (data) {
      console.log('from redis')
      return res.send(JSON.parse(data))
    }
    console.log('from api')
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${name}?unitGroup=us&key=ZS47EQ3ZQF5VDZA76PCA9HAZU&contentType=json`
    let result
    try {
      result = await axios.get(url)
      await client.set(name, JSON.stringify(result.data))
      await client.expire(name, 3600)
      return res.send(result.data)
    } catch (error) {
      return res.json('Please enter a valid location.')
    }
  }
  return res.json('Must enter a location.')
})

app.listen(port, () => {
  console.log(`The server is listening on http://localhost:${port}`)
})

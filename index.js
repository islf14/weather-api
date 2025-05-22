import axios from 'axios';
import express from 'express'
import { createClient } from 'redis'

const app = express()
const port = 3000
const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

app.get('/', (req, res) => {
  res.json('Server listening, please enter param /location')
})

app.get('/:name', async (req, res) => {
  const { name } = req.params
  if (name) {
    const data = await client.get(name)
    if (data) {
      return res.send(JSON.parse(data))
    }
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

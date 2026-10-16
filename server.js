
import express from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Create the OpenAI client
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 20000,
      maxRetries: 0,
    })
  : null

// Health check — should respond immediately
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MoodReel backend is running!',
  })
})

// Movie recommendations
app.post('/api/recommend', async (req, res) => {
  console.log('Received recommendation request')

  if (!client) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is missing from the backend .env file.',
    })
  }

  const { name, mood, context } = req.body || {}

  if (!mood) {
    return res.status(400).json({
      error: 'Please select a mood first.',
    })
  }

  try {
    console.log('Requesting recommendations from OpenAI...')

    const response = await client.responses.create({
      model: 'gpt-5-nano',
      instructions: `
You are MoodReel, a warm and thoughtful movie recommender.
Recommend exactly 3 real movies matching the user's mood and context.
For each movie, include its title, release year, and a short,
empathetic explanation of why it fits their feelings.
Use numbered recommendations. Never invent movie titles.
Address the user naturally and do not judge their feelings.
`,
      input: `
Name: ${String(name || 'Movie lover').slice(0, 80)}
Mood: ${String(mood).slice(0, 100)}
Context: ${String(context || 'No additional context').slice(0, 1500)}
`,
    })

    console.log('Recommendations received successfully')

    return res.json({
      recommendations: response.output_text,
    })
  } catch (error) {
    console.error('OpenAI error:', error.message)
    console.error('Status:', error.status || 'unknown')
    console.error('Code:', error.code || 'unknown')

    return res.status(error.status === 429 ? 429 : 500).json({
      error:
        error.status === 429
          ? 'OpenAI quota or rate limit reached. Check your API billing.'
          : 'Could not get recommendations. Please try again.',
    })
  }
})

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`MoodReel backend running on port ${PORT}`)
})

server.on('error', (error) => {
  console.error('Server startup error:', error.message)
})


import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [mood, setMood] = useState('')
  const [context, setContext] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [step, setStep] = useState('welcome')
  const [loading, setLoading] = useState(false)

  const moods = [
    'Heartbroken 💔',
    'Lonely 🌙',
    'Happy ☀️',
    'Hopeful 🌱',
    'Nostalgic 🎞️',
    'Confused 🌀',
  ]

  function handleContinue() {
    if (name.trim()) {
      setStep('mood')
    }
  }

  function handleMoodSelect(selectedMood) {
    setMood(selectedMood)
    setContext('')
    setRecommendations('')
    setStep('context')
  }

  async function getRecommendations(story) {
    setLoading(true)
    setStep('loading')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/recommend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            mood,
            context: story,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

      setRecommendations(data.recommendations)
      setStep('recommendations')
    } catch (error) {
      console.error('Recommendation error:', error)
      alert(error.message || 'Could not get recommendations.')
      setStep('context')
    } finally {
      setLoading(false)
    }
  }

  function handleContextSubmit() {
    getRecommendations(context.trim())
  }

  function handleSkip() {
    setContext('')
    setStep('skipMessage')

    window.setTimeout(() => {
      getRecommendations('')
    }, 4000)
  }

  function handleRestart() {
    setMood('')
    setContext('')
    setRecommendations('')
    setStep('mood')
  }

  return (
    <main className="welcome-page">
      <header className="top-bar">
        <h2 className="logo">🎬 MOODREEL</h2>
      </header>

      {step === 'welcome' && (
        <section className="welcome-content">
          <p className="eyebrow">YOUR FEELINGS. YOUR FILMS.</p>
          <h1>Every mood has a movie.</h1>
          <p className="subtitle">
            Before we begin, let's get to know you.
          </p>

          <label htmlFor="name">
            PLEASE GIVE YOURSELF A NAME
          </label>
          <input
            id="name"
            type="text"
            placeholder="What should we call you?"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleContinue()
            }}
          />

          <button onClick={handleContinue}>
            LET'S BEGIN →
          </button>
          <small>Your movie journey starts here.</small>
        </section>
      )}

      {step === 'mood' && (
        <section className="chat-screen">
          <div className="chat-message">
            <p className="eyebrow">MOODREEL</p>
            <h1>Hey, {name.trim()}! 👋</h1>
            <p>Welcome to MoodReel. I'm glad you're here.</p>
            <p>How are you feeling today?</p>
          </div>

          <div className="mood-options">
            {moods.map((item) => (
              <button
                className="mood-button"
                key={item}
                onClick={() => handleMoodSelect(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 'context' && (
        <section className="chat-screen">
          <div className="chat-message">
            <p className="eyebrow">MOODREEL</p>
            <h1>Tell me a little more, {name.trim()}.</h1>
            <p>
              Is there a story behind feeling {mood.toLowerCase()}?
            </p>
            <p>
              You can share what's on your mind, or skip this part.
            </p>
          </div>

          <textarea
            placeholder="What's on your mind? (Optional)"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            rows={5}
          />

          <div className="action-buttons">
            <button
              onClick={handleContextSubmit}
              disabled={loading}
            >
              FIND MY MOVIES →
            </button>
            <button
              className="secondary-button"
              onClick={handleSkip}
              disabled={loading}
            >
              SKIP
            </button>
          </div>
        </section>
      )}

      {step === 'skipMessage' && (
        <section className="chat-screen skip-message">
          <p className="eyebrow">MOODREEL HAS NOTICED 👀</p>
          <h1>Manam anukunanta best kaadu annamatta 💔😂</h1>
          <p>
            Sare le... maatladakapoyina parledhu.
            Cinema tho baadha marchipodham! 🎬
          </p>
        </section>
      )}

      {step === 'loading' && (
        <section className="chat-screen">
          <p className="eyebrow">MOODREEL</p>
          <h1>Finding your kind of movie, {name.trim()}... 🎬</h1>
          <p className="subtitle">
            Matching your mood with stories that might resonate.
            Just a moment! 🍿
          </p>
        </section>
      )}

      {step === 'recommendations' && (
        <section className="chat-screen">
          <p className="eyebrow">YOUR NEXT MOVIE</p>
          <h1>We've got you, {name.trim()} 🎬</h1>
          <p>
            You're feeling: <strong>{mood}</strong>
          </p>

          <div className="placeholder-card">
            <span className="movie-icon">🎞️</span>
            <h2>Your movie recommendations</h2>
            <p className="recommendation-text">
              {recommendations}
            </p>
            <p>
              Grab some snacks, get comfortable, and let the
              movie do its thing. 🍿
            </p>
          </div>

          <button onClick={handleRestart}>
            TRY ANOTHER MOOD ↻
          </button>
        </section>
      )}
    </main>
  )
}

export default App
export default async function handler(req, res) {
  const today = new Date()
  const timestamp = Math.floor(today.getTime() / 1000)

  try {
    const response = await fetch(
      `https://api.farmsense.net/v1/moonphases/?d=${timestamp}`
    )
    const moon = await response.json()

    const now = today.toISOString().split('T')[0]
    
    res.status(200).json({ 
      moon: moon[0],
      date: now
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

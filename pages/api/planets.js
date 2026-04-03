export default async function handler(req, res) {
  const appId = process.env.ASTRONOMY_APP_ID
  const appSecret = process.env.ASTRONOMY_APP_SECRET
  
  const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64')
  
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  try {
    const response = await fetch(
      `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=40.5853&longitude=-105.0844&elevation=1525&from_date=${dateStr}&to_date=${dateStr}&time=09:00:00`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      }
    )
    
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

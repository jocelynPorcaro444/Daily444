export default async function handler(req, res) {
  try {
    const ephemeris = require('ephemeris')
    
    const now = new Date()
    
    const result = ephemeris.getAllPlanets(
      {
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
        day: now.getUTCDate(),
        hours: now.getUTCHours()
      },
      -105.0844,
      40.5853,
      1525
    )

    const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
    const HOUSE_MAP = {
      "Aries":"6H","Taurus":"7H","Gemini":"8H","Cancer":"9H","Leo":"10H","Virgo":"11H",
      "Libra":"12H","Scorpio":"1H","Sagittarius":"2H","Capricorn":"3H","Aquarius":"4H","Pisces":"5H"
    }

    const planets = []
    const bodies = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']
    const names = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']

    bodies.forEach((body, i) => {
      if (result.observed[body]) {
        const lon = result.observed[body].apparentLongitudeDd
        const signIndex = Math.floor(lon / 30)
        const degree = (lon % 30).toFixed(1)
        const sign = ZODIAC[signIndex]
        const house = HOUSE_MAP[sign]
        planets.push({
          planet: names[i],
          sign,
          degree: `${degree}°`,
          house,
          note: ''
        })
      }
    })

    res.status(200).json({ planets })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

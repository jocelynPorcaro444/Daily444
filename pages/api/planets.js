export default async function handler(req, res) {
  try {
    const now = new Date()
    
    const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
      "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
    
    const HOUSE_MAP = {
      "Aries":"6H","Taurus":"7H","Gemini":"8H","Cancer":"9H","Leo":"10H","Virgo":"11H",
      "Libra":"12H","Scorpio":"1H","Sagittarius":"2H","Capricorn":"3H","Aquarius":"4H","Pisces":"5H"
    }

    function julianDay(date) {
      return date.getTime() / 86400000 + 2440587.5
    }

    function normalize(deg) {
      return ((deg % 360) + 360) % 360
    }

    function getSign(lon) {
      const index = Math.floor(normalize(lon) / 30)
      const degree = (normalize(lon) % 30).toFixed(1)
      return { sign: ZODIAC[index], degree: `${degree}°`, house: HOUSE_MAP[ZODIAC[index]] }
    }

    const JD = julianDay(now)
    const T = (JD - 2451545.0) / 36525

    // Simplified planetary longitudes
    const planets = [
      { planet: "Sun", lon: normalize(280.46646 + 36000.76983 * T) },
      { planet: "Moon", lon: normalize(218.3165 + 481267.8813 * T) },
      { planet: "Mercury", lon: normalize(252.2509 + 149472.6674 * T) },
      { planet: "Venus", lon: normalize(181.9798 + 58517.8156 * T) },
      { planet: "Mars", lon: normalize(355.4330 + 19140.2993 * T) },
      { planet: "Jupiter", lon: normalize(34.3515 + 3034.9057 * T) },
      { planet: "Saturn", lon: normalize(50.0774 + 1222.1138 * T) },
      { planet: "Uranus", lon: normalize(314.0550 + 428.4882 * T) },
      { planet: "Neptune", lon: normalize(304.3487 + 218.4862 * T) },
      { planet: "Pluto", lon: normalize(238.9290 + 145.2078 * T) },
    ]

    const result = planets.map(p => {
      const { sign, degree, house } = getSign(p.lon)
      return { planet: p.planet, sign, degree, house, note: '' }
    })

    res.status(200).json({ planets: result })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

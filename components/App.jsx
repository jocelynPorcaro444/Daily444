import { useState, useEffect } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const HOUSE_MAP = {
  "Aries": "6H", "Taurus": "7H", "Gemini": "8H", "Cancer": "9H",
  "Leo": "10H", "Virgo": "11H", "Libra": "12H", "Scorpio": "1H",
  "Sagittarius": "2H", "Capricorn": "3H", "Aquarius": "4H", "Pisces": "5H"
};

const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

function degreeToSign(degree) {
  const index = Math.floor(degree / 30);
  const pos = (degree % 30).toFixed(1);
  return { sign: ZODIAC_SIGNS[index], degree: `${pos}°` };
}

function buildPrompt(dateStr, planets) {
  const planetLines = planets.map(p =>
    `${p.planet} ${p.degree} ${p.sign} → her ${p.house} (${p.note})`
  ).join('\n');

  return `You are a skilled astrologer. Generate a personal daily horoscope for Jocelyn for ${dateStr}.

JOCELYN'S NATAL CHART (Scorpio rising, born March 9 1978):
House system: Aries=6H health/routine, Taurus=7H partnerships, Gemini=8H transformation, Cancer=9H beliefs/travel, Leo=10H career, Virgo=11H community, Libra=12H subconscious, Scorpio=1H self, Sagittarius=2H money, Capricorn=3H communication, Aquarius=4H home, Pisces=5H creativity/joy
Natal: Sun 19 Pisces 5H, Moon 1 Aries 6H, Mercury 29 Capricorn 3H, Venus 0 Aries 6H, Mars 22 Cancer 8H rx, Jupiter 26 Gemini 8H, Saturn 25 Leo 9H, Uranus 16 Scorpio 1H rx, Pluto 16 Libra 12H rx
About Jocelyn: healthcare professional with integrative/functional medicine background, recently finished a 72-hour water fast, on a 60-day gut reset protocol, practices hot yoga, grows lion's mane mushrooms, crochets, gluten-free since 2026, lives in Fort Collins CO, two daughters, partner Steve.

CURRENT LIVE TRANSITS for ${dateStr} (fetched automatically from astronomy API):
${planetLines}
Solar Eclipse in Aries on April 14 — directly hitting her 6H. Major new beginning in health and body.
Saturn in Aries until 2028 — long term restructuring of her 6H.
Neptune in Aries first time in 165 years — spiritual renewal of her 6H.

Make the reading warm, specific, personal. Reference her actual life context naturally. Speak directly to her.

Respond ONLY with valid JSON, no markdown, no backticks:
{"overall":"2-3 sentence overall theme","health":"2 sentences health and body","work":"2 sentences healing work and service","relationships":"2 sentences relationships","inner":"2 sentences inner life and intuition","energy_physical":75,"energy_emotional":65,"energy_mental":80,"energy_spiritual":90,"word_of_day":"OneWord","lucky_number":9,"affirmation":"short powerful affirmation for Jocelyn","watch_for":"one thing to be mindful of today"}`;
}

function EnergyBar({ label, value }) {
  const color = value >= 75 ? "#5DCAA5" : value >= 50 ? "#EF9F27" : "#F0997B";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
      <span style={{ fontSize:13, color:"#a89880", minWidth:70 }}>{label}</span>
      <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:3 }} />
      </div>
      <span style={{ fontSize:12, color:"#a89880", minWidth:30, textAlign:"right" }}>{value}%</span>
    </div>
  );
}

export default function App() {
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planets, setPlanets] = useState([]);
  const [planetsLoading, setPlanetsLoading] = useState(true);

  const today = new Date();
  const dateStr = `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const dayStr = `${DAYS[today.getDay()]}, ${dateStr}`;

  useEffect(() => {
    async function fetchPlanets() {
      try {
  const res = await fetch('/api/planets');
  const data = await res.json();
  const parsed = (data.planets || []).map(p => ({
    ...p,
    note: p.planet === 'Sun' ? 'identity & vitality' :
          p.planet === 'Moon' ? 'emotions & instincts' :
          p.planet === 'Mercury' ? 'mind & communication' :
          p.planet === 'Venus' ? 'love & values' :
          p.planet === 'Mars' ? 'drive & action' :
          p.planet === 'Jupiter' ? 'expansion & luck' :
          p.planet === 'Saturn' ? 'discipline & lessons' :
          p.planet === 'Uranus' ? 'awakening & change' :
          p.planet === 'Neptune' ? 'dreams & spirituality' :
          p.planet === 'Pluto' ? 'transformation & power' : ''
  }));
  setPlanets(parsed);
      } catch(e) {
        console.error('Planet fetch failed:', e);
      } finally {
        setPlanetsLoading(false);
      }
    }
    fetchPlanets();
  }, []);

  async function generateReading() {
    setLoading(true);
    setError(null);
    setReading(null);
    try {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(dateStr, planets) })
      });
      const data = await res.json();
      const raw = (data.content || []).map(i => i.text || "").join("").trim();
      const j1 = raw.indexOf("{"), j2 = raw.lastIndexOf("}");
      if (j1 === -1) throw new Error("No JSON returned");
      setReading(JSON.parse(raw.slice(j1, j2 + 1)));
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const card = { background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"1.25rem", marginBottom:"1rem" };
  const label = { fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8a7a6a", marginBottom:8 };
  const body = { fontSize:15, lineHeight:1.75, color:"#e8ddd0", fontFamily:"'Crimson Pro', Georgia, serif" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1a1208 0%,#120d1a 50%,#0d1218 100%)", padding:"2rem 1.5rem", fontFamily:"Georgia, serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
      <div style={{ maxWidth:640, margin:"0 auto" }}>

        <div style={{ marginBottom:"2rem", borderBottom:"0.5px solid rgba(255,255,255,0.1)", paddingBottom:"1.5rem" }}>
          <div style={{ fontSize:12, color:"#8a7a6a", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{dayStr}</div>
          <div style={{ fontSize:32, fontWeight:300, color:"#f0e8d8", fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1.2, marginBottom:6 }}>Your daily reading</div>
          <div style={{ fontSize:14, color:"#a89880" }}>Scorpio rising · Sun in Pisces · Moon in Aries</div>
        </div>

        {planetsLoading ? (
          <div style={{ color:"#a89880", fontSize:13, fontStyle:"italic", marginBottom:"1.5rem" }}>Scanning the sky...</div>
        ) : (
          <div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1rem" }}>
              {planets.map(p => (
                <div key={p.planet} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, background:p.sign==="Aries"?"rgba(240,153,123,0.15)":"rgba(255,255,255,0.06)", border:p.sign==="Aries"?"0.5px solid rgba(240,153,123,0.4)":"0.5px solid rgba(255,255,255,0.1)", color:p.sign==="Aries"?"#F0997B":"#c4b49a" }}>
                  <span style={{ fontWeight:500 }}>{p.planet}</span> {p.degree} {p.sign} → {p.house}
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, color:"#F0997B", marginBottom:"1.5rem", fontStyle:"italic" }}>
              ✦ Live sky data · Solar Eclipse in Aries Apr 14 · Saturn in your 6H until 2028
            </div>
          </div>
        )}

        {!reading && !loading && (
          <div>
            <button onClick={generateReading} disabled={planetsLoading} style={{ padding:"12px 28px", background:"rgba(240,153,123,0.15)", border:"0.5px solid rgba(240,153,123,0.5)", borderRadius:8, color:"#F0997B", fontSize:15, cursor:"pointer", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"0.05em", opacity:planetsLoading?0.5:1 }}>
              Read today's chart →
            </button>
            {error && <div style={{ marginTop:12, color:"#F0997B", fontSize:13 }}>Error: {error}</div>}
          </div>
        )}

        {loading && <div style={{ color:"#a89880", fontSize:15, fontStyle:"italic", padding:"2rem 0" }}>Consulting the cosmos...</div>}

        {reading && (
          <div>
            <div style={{ ...card, borderLeft:"2px solid rgba(240,153,123,0.5)" }}>
              <div style={label}>Today's theme</div>
              <div style={{ ...body, fontSize:16 }}>{reading.overall}</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
              {[["Health & body", reading.health],["Work & service", reading.work],["Relationships", reading.relationships],["Inner life", reading.inner]].map(([l, t]) => (
                <div key={l} style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"1rem" }}>
                  <div style={label}>{l}</div>
                  <div style={{ ...body, fontSize:14 }}>{t}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={label}>Energy forecast</div>
              {[["Physical",reading.energy_physical],["Emotional",reading.energy_emotional],["Mental",reading.energy_mental],["Spiritual",reading.energy_spiritual]].map(([l,v]) => (
                <EnergyBar key={l} label={l} value={v} />
              ))}
            </div>

            <div style={{ ...card, background:"rgba(240,153,123,0.06)", borderColor:"rgba(240,153,123,0.2)", textAlign:"center" }}>
              <div style={label}>Affirmation</div>
              <div style={{ ...body, fontSize:18, fontStyle:"italic", color:"#f0e8d8" }}>"{reading.affirmation}"</div>
            </div>

            <div style={{ display:"flex", gap:"1rem", marginBottom:"1rem" }}>
              <div style={{ ...card, flex:1, marginBottom:0 }}>
                <div style={label}>Word of the day</div>
                <div style={{ fontSize:26, fontWeight:300, color:"#f0e8d8", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{reading.word_of_day}</div>
              </div>
              <div style={{ ...card, minWidth:90, textAlign:"center", marginBottom:0 }}>
                <div style={label}>Lucky</div>
                <div style={{ fontSize:36, fontWeight:300, color:"#f0e8d8", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{reading.lucky_number}</div>
              </div>
            </div>

            <div style={{ ...card, borderLeft:"2px solid rgba(239,159,39,0.5)" }}>
              <div style={label}>Watch for today</div>
              <div style={body}>{reading.watch_for}</div>
            </div>

            <div style={{ marginTop:"1.5rem" }}>
              <button onClick={generateReading} style={{ padding:"10px 22px", background:"rgba(240,153,123,0.12)", border:"0.5px solid rgba(240,153,123,0.4)", borderRadius:8, color:"#F0997B", fontSize:14, cursor:"pointer", fontFamily:"Georgia,serif" }}>
                New reading →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const TRANSITS = [
  { planet: "Sun", degree: "12°", sign: "Aries", house: "6H" },
  { planet: "Mercury", degree: "5°", sign: "Aries", house: "6H" },
  { planet: "Venus", degree: "20°", sign: "Aries", house: "6H" },
  { planet: "Neptune", degree: "0°", sign: "Aries", house: "6H" },
  { planet: "Mars", degree: "18°", sign: "Cancer", house: "9H" },
  { planet: "Jupiter", degree: "20°", sign: "Gemini", house: "8H" },
  { planet: "Saturn", degree: "26°", sign: "Pisces", house: "5H" },
  { planet: "Pluto", degree: "3°", sign: "Aquarius", house: "4H" },
];

function buildPrompt(dateStr) {
  return `You are a skilled astrologer. Generate a personal daily horoscope for Jocelyn for ${dateStr}.

JOCELYN'S NATAL CHART (Scorpio rising, born March 9 1978):
House system: Aries=6H health/routine, Taurus=7H partnerships, Gemini=8H transformation, Cancer=9H beliefs/travel, Leo=10H career, Virgo=11H community, Libra=12H subconscious, Scorpio=1H self, Sagittarius=2H money, Capricorn=3H communication, Aquarius=4H home, Pisces=5H creativity
Natal: Sun 19 Pisces 5H, Moon 1 Aries 6H, Mercury 29 Capricorn 3H, Venus 0 Aries 6H, Mars 22 Cancer 8H rx, Jupiter 26 Gemini 8H, Saturn 25 Leo 9H
About Jocelyn: healthcare professional with integrative/functional medicine background, recently finished a 72-hour water fast, on a 60-day gut reset protocol, practices hot yoga, grows lion's mane mushrooms, crochets, gluten-free since 2026, lives in Fort Collins CO, two daughters, partner Steve.

CURRENT TRANSITS ${dateStr}:
7 planets in Aries all transiting her 6th house of health, body, daily routine and service. Extraordinary activation.
Neptune just entered Aries 0° first time in 165 years — spiritual renewal to her 6th house.
Jupiter 20 Gemini her 8H, Saturn 26 Pisces her 5H, Pluto 3 Aquarius her 4H, Mars 18 Cancer her 9H.

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

  const today = new Date();
  const dateStr = `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const dayStr = `${DAYS[today.getDay()]}, ${dateStr}`;

  async function generateReading() {
    setLoading(true);
    setError(null);
    setReading(null);
    try {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(dateStr) })
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
      <div style={{ maxWidth:640, margin:"0 auto" }}>

        <div style={{ marginBottom:"2rem", borderBottom:"0.5px solid rgba(255,255,255,0.1)", paddingBottom:"1.5rem" }}>
          <div style={{ fontSize:12, color:"#8a7a6a", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{dayStr}</div>
          <div style={{ fontSize:32, fontWeight:300, color:"#f0e8d8", fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1.2, marginBottom:6 }}>Your daily reading</div>
          <div style={{ fontSize:14, color:"#a89880" }}>Scorpio rising · Sun in Pisces · Moon in Aries</div>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1rem" }}>
          {TRANSITS.map(t => (
            <div key={t.planet} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, background:t.sign==="Aries"?"rgba(240,153,123,0.15)":"rgba(255,255,255,0.06)", border:t.sign==="Aries"?"0.5px solid rgba(240,153,123,0.4)":"0.5px solid rgba(255,255,255,0.1)", color:t.sign==="Aries"?"#F0997B":"#c4b49a" }}>
              <span style={{ fontWeight:500 }}>{t.planet}</span> {t.degree} {t.sign} → {t.house}
            </div>
          ))}
        </div>

        <div style={{ fontSize:12, color:"#F0997B", marginBottom:"1.5rem", fontStyle:"italic" }}>
          ✦ 7 planets in Aries — all activating your 6th house of health &amp; healing
        </div>

        {!reading && !loading && (
          <div>
            <button onClick={generateReading} style={{ padding:"12px 28px", background:"rgba(240,153,123,0.15)", border:"0.5px solid rgba(240,153,123,0.5)", borderRadius:8, color:"#F0997B", fontSize:15, cursor:"pointer", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"0.05em" }}>
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

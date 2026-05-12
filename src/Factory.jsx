import { useState, useRef, useEffect } from "react";

// ── Niche data ────────────────────────────────────────────────────────────────
const NICHES = [
  { id:"productivity", label:"Productivity & Notion", icon:"⚡", competition:"Medium", demand:"Very High", avgPrice:"£18–£65", platforms:["Etsy","Gumroad"] },
  { id:"finance",      label:"Personal Finance",      icon:"💷", competition:"Medium", demand:"High",      avgPrice:"£9–£35",  platforms:["Etsy","Gumroad"] },
  { id:"aiprompts",    label:"AI Prompt Packs",        icon:"🤖", competition:"Low",    demand:"Explosive", avgPrice:"£12–£49", platforms:["Gumroad","Whop"] },
  { id:"social",       label:"Social Media Templates", icon:"📱", competition:"Medium", demand:"Very High", avgPrice:"£15–£55", platforms:["Etsy","Creative Market"] },
  { id:"wellness",     label:"Wellness & Journals",    icon:"🌿", competition:"Low",    demand:"High",      avgPrice:"£8–£28",  platforms:["Etsy","Gumroad"] },
  { id:"business",     label:"Business Templates",     icon:"📊", competition:"Medium", demand:"High",      avgPrice:"£25–£99", platforms:["Gumroad","Creative Market"] },
  { id:"education",    label:"Educational Printables", icon:"📚", competition:"Low",    demand:"High",      avgPrice:"£5–£22",  platforms:["Etsy","Teachers Pay Teachers"] },
  { id:"dogbreeding",  label:"Pet & Dog Niche",        icon:"🐕", competition:"Low",    demand:"Growing",   avgPrice:"£8–£35",  platforms:["Etsy","Gumroad"] },
];

const PRODUCT_TYPES = [
  { id:"prompts",   label:"AI Prompt Pack",     desc:"Curated prompts for a specific use case" },
  { id:"template",  label:"Notion Template",    desc:"Ready-to-use productivity system" },
  { id:"ebook",     label:"eBook / Guide",      desc:"30–60 page actionable guide" },
  { id:"printable", label:"Printable / Planner",desc:"PDF printable or digital planner" },
  { id:"bundle",    label:"Product Bundle",     desc:"3–5 products sold as a vault" },
  { id:"canva",     label:"Canva Template Kit", desc:"Social media or branding templates" },
];

const STEPS = ["niche","product","generate","listing"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const demandColor = d =>
  d==="Explosive"?"#ff6b35":d==="Very High"?"#ffd166":d==="High"?"#a8e6cf":"#b8bdd0";
const compColor = c =>
  c==="Low"?"#a8e6cf":c==="Medium"?"#ffd166":"#ff6b6b";

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Factory() {
  const [step, setStep]             = useState(0);
  const [niche, setNiche]           = useState(null);
  const [productType, setProductType] = useState(null);
  const [customIdea, setCustomIdea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState(null);
  const [activeTab, setActiveTab]   = useState("product");
  const [copied, setCopied]         = useState("");
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const topRef = useRef(null);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior:"smooth" }); }, [step]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // ── Generation ──────────────────────────────────────────────────────────────
  async function generate() {
    if (!niche || !productType) return;
    setGenerating(true);
    setGenerated(null);
    setStep(3);

    const selectedNiche  = NICHES.find(n => n.id === niche);
    const selectedType   = PRODUCT_TYPES.find(t => t.id === productType);
    const ideaContext    = customIdea ? `Specific angle: "${customIdea}"` : "";

    const prompt = `You are an expert digital product creator and Etsy/Gumroad seller. Generate a complete, ready-to-sell digital product for the following brief:

Niche: ${selectedNiche.label}
Product Type: ${selectedType.label} (${selectedType.desc})
Target Platforms: ${selectedNiche.platforms.join(", ")}
Typical Price Range: ${selectedNiche.avgPrice}
${ideaContext}

Respond ONLY with a valid JSON object. No preamble, no markdown fences, just raw JSON. Use this exact structure:
{
  "productTitle": "Compelling product title (max 12 words)",
  "tagline": "One-sentence hook for the listing",
  "recommendedPrice": "£XX",
  "estimatedMonthlyIncome": "£XXX–£XXX/mo (realistic passive income estimate)",
  "productContents": ["item 1","item 2","item 3","item 4","item 5","item 6"],
  "etsyTitle": "SEO-optimised Etsy listing title (include keywords buyers search for)",
  "etsyDescription": "Full Etsy product description (150–200 words). Include: hook opening, what's included, who it's for, why it's valuable, and a call to action. Make it compelling and conversion-focused.",
  "etsyTags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"],
  "gumroadBlurb": "Short Gumroad product blurb (60–80 words). Punchy, benefit-driven, casual tone.",
  "contentOutline": ["Section 1: ...","Section 2: ...","Section 3: ...","Section 4: ...","Section 5: ..."],
  "launchStrategy": "3-step launch strategy for getting first 10 sales",
  "bundleIdea": "A related product or bundle upgrade idea to increase revenue",
  "seoKeywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"]
}`;

    try {
      const res  = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            contents:[{ parts:[{ text:prompt }] }],
            generationConfig:{ maxOutputTokens:4000 },
          }),
        }
      );
      const data = await res.json();
      console.log("[Gemini Factory] key present:", !!import.meta.env.VITE_GEMINI_KEY);
      console.log("[Gemini Factory] response:", JSON.stringify(data, null, 2));
      const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      // Robustly extract JSON by finding outermost { }
      const start = raw.indexOf("{");
      const end   = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found in response");
      const clean = raw.slice(start, end + 1);
      const obj  = JSON.parse(clean);
      setGenerated(obj);
      setHistory(h => [{ niche:selectedNiche.label, type:selectedType.label, product:obj, ts:Date.now() }, ...h.slice(0,9)]);
      setActiveTab("product");
    } catch(e) {
      setGenerated({ error:"Generation failed. Please try again. (" + e.message + ")" });
    }
    setGenerating(false);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function reset() {
    setStep(0); setNiche(null); setProductType(null);
    setCustomIdea(""); setGenerated(null);
  }

  const selectedNiche  = NICHES.find(n => n.id === niche);
  const selectedType   = PRODUCT_TYPES.find(t => t.id === productType);

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = (active) => ({
    border:`1.5px solid ${active?"#ff6b35":"rgba(255,255,255,0.07)"}`,
    borderRadius:10,
    padding:"14px 16px",
    cursor:"pointer",
    background: active?"rgba(255,107,53,0.07)":"rgba(255,255,255,0.02)",
    transition:"all 0.18s",
  });

  const btn = (primary, disabled) => ({
    padding:"11px 24px",
    borderRadius:8,
    border:"none",
    cursor: disabled?"not-allowed":"pointer",
    fontFamily:"'Syne', sans-serif",
    fontWeight:700,
    fontSize:13,
    letterSpacing:"0.5px",
    background: disabled?"rgba(255,255,255,0.06)": primary?"linear-gradient(135deg,#ff6b35,#ffd166)":"rgba(255,255,255,0.08)",
    color: disabled?"#444":primary?"#1a0a00":"#e8ddd5",
    transition:"all 0.2s",
    opacity: disabled?0.5:1,
  });

  const copyBtn = (key) => ({
    padding:"5px 12px", borderRadius:6,
    border:`1px solid ${copied===key?"#a8e6cf":"rgba(255,255,255,0.12)"}`,
    background: copied===key?"rgba(168,230,207,0.12)":"rgba(255,255,255,0.04)",
    color: copied===key?"#a8e6cf":"#888", fontSize:11,
    cursor:"pointer", fontFamily:"'Syne', sans-serif",
    transition:"all 0.2s",
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      background:"#110c08",
      color:"#e8ddd5",
      fontFamily:"'Syne', sans-serif",
      backgroundImage:"radial-gradient(ellipse at 10% 0%, rgba(255,107,53,0.08) 0%, transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(255,209,102,0.05) 0%, transparent 50%)",
    }}>
      <style>{`
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,107,53,0.3);border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .fade-up{animation:fadeUp 0.4s ease forwards}
        textarea,input{outline:none;resize:vertical}
      `}</style>

      {/* ── Header ── */}
      <div ref={topRef} style={{ borderBottom:"1px solid rgba(255,107,53,0.15)", padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(17,12,8,0.95)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:"linear-gradient(135deg,#ff6b35,#ffd166)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚙</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.3px" }}>Digital Product Factory</div>
            <div style={{ fontSize:11, color:"#664433", fontWeight:500 }}>AI-POWERED PASSIVE INCOME GENERATOR</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {history.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} style={{ ...btn(false, false), padding:"7px 14px", fontSize:12 }}>
              {showHistory?"← Back":"History ({history.length})".replace("{history.length}", history.length)}
            </button>
          )}
          {step > 0 && !showHistory && <button onClick={reset} style={{ ...btn(false, false), padding:"7px 14px", fontSize:12 }}>New Product</button>}
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"28px 20px" }}>

        {/* ── History panel ── */}
        {showHistory && (
          <div className="fade-up">
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>Generated Products</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {history.map((h,i) => (
                <div key={i} onClick={() => { setGenerated(h.product); setStep(3); setShowHistory(false); }}
                  style={{ ...card(false), display:"flex", justifyContent:"space-between", alignItems:"center" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#ff6b35"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{h.product.productTitle}</div>
                    <div style={{ fontSize:11, color:"#664433", marginTop:3 }}>{h.niche} · {h.type} · {h.product.recommendedPrice}</div>
                  </div>
                  <div style={{ fontSize:11, color:"#555" }}>{new Date(h.ts).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showHistory && (
          <>
            {/* ── Step indicator ── */}
            {step < 3 && (
              <div style={{ display:"flex", gap:0, marginBottom:32, alignItems:"center" }}>
                {["Pick Niche","Choose Format","Generate"].map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center" }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:20,
                      background: step===i?"rgba(255,107,53,0.15)":"transparent",
                      border: step===i?"1px solid rgba(255,107,53,0.4)":"1px solid transparent",
                    }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700,
                        background: i<=step?"linear-gradient(135deg,#ff6b35,#ffd166)":"rgba(255,255,255,0.08)",
                        color: i<=step?"#1a0a00":"#555"
                      }}>{i+1}</div>
                      <span style={{ fontSize:12, color:step===i?"#ffd166":"#555", fontWeight:600 }}>{s}</span>
                    </div>
                    {i < 2 && <div style={{ width:24, height:1, background:"rgba(255,255,255,0.08)" }}/>}
                  </div>
                ))}
              </div>
            )}

            {/* ══ STEP 0: Niche ══ */}
            {step === 0 && (
              <div className="fade-up">
                <div style={{ marginBottom:24 }}>
                  <h1 style={{ fontSize:28, fontWeight:800, margin:"0 0 6px", letterSpacing:"-0.5px" }}>
                    What niche will you sell in?
                  </h1>
                  <p style={{ margin:0, color:"#664433", fontSize:14 }}>
                    Pick the market that matches your interests or knowledge. Lower competition = faster first sales.
                  </p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, marginBottom:28 }}>
                  {NICHES.map(n => (
                    <div key={n.id} onClick={() => setNiche(n.id)} style={card(niche===n.id)}
                      onMouseEnter={e=>{ if(niche!==n.id) e.currentTarget.style.borderColor="rgba(255,107,53,0.3)"; }}
                      onMouseLeave={e=>{ if(niche!==n.id) e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:22 }}>{n.icon}</span>
                        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:compColor(n.competition)+"22", color:compColor(n.competition), fontWeight:600 }}>{n.competition} comp.</span>
                      </div>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{n.label}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:11, color:"#664433" }}>{n.avgPrice}</span>
                        <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:demandColor(n.demand)+"22", color:demandColor(n.demand), fontWeight:600 }}>{n.demand}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => niche && setStep(1)} style={btn(true, !niche)}>
                  Continue → Choose Format
                </button>
              </div>
            )}

            {/* ══ STEP 1: Product type ══ */}
            {step === 1 && (
              <div className="fade-up">
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:12, color:"#664433", marginBottom:4, fontWeight:600 }}>NICHE: {selectedNiche?.label} {selectedNiche?.icon}</div>
                  <h1 style={{ fontSize:28, fontWeight:800, margin:"0 0 6px", letterSpacing:"-0.5px" }}>What kind of product?</h1>
                  <p style={{ margin:0, color:"#664433", fontSize:14 }}>Each format has different creation effort and price points. Bundles earn the most per sale.</p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10, marginBottom:24 }}>
                  {PRODUCT_TYPES.map(t => (
                    <div key={t.id} onClick={() => setProductType(t.id)} style={card(productType===t.id)}
                      onMouseEnter={e=>{ if(productType!==t.id) e.currentTarget.style.borderColor="rgba(255,107,53,0.3)"; }}
                      onMouseLeave={e=>{ if(productType!==t.id) e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t.label}</div>
                      <div style={{ fontSize:12, color:"#664433" }}>{t.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Custom idea */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:12, color:"#664433", display:"block", marginBottom:8, fontWeight:600 }}>
                    SPECIFIC ANGLE (optional — leave blank for AI to decide)
                  </label>
                  <textarea
                    value={customIdea}
                    onChange={e => setCustomIdea(e.target.value)}
                    placeholder={`e.g. "Notion CRM template for freelance dog groomers" or "AI prompts for writing Etsy listings"`}
                    rows={2}
                    style={{ width:"100%", padding:"12px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", color:"#e8ddd5", fontSize:13, fontFamily:"'Syne', sans-serif", boxSizing:"border-box" }}
                  />
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => setStep(0)} style={btn(false, false)}>← Back</button>
                  <button onClick={generate} style={btn(true, !productType)}>
                    ⚙ Generate Product
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 3: Results ══ */}
            {step === 3 && (
              <div className="fade-up">
                {generating ? (
                  <div style={{ textAlign:"center", padding:"80px 0" }}>
                    <div style={{ width:40, height:40, border:"3px solid rgba(255,107,53,0.2)", borderTopColor:"#ff6b35", borderRadius:"50%", margin:"0 auto 20px", animation:"spin 0.8s linear infinite" }}/>
                    <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Building your product…</div>
                    <div style={{ fontSize:13, color:"#664433" }}>Generating content, listing copy, SEO tags & strategy</div>
                  </div>
                ) : generated?.error ? (
                  <div style={{ textAlign:"center", padding:60 }}>
                    <div style={{ color:"#ff6b6b", marginBottom:12 }}>{generated.error}</div>
                    <button onClick={generate} style={btn(true,false)}>Try Again</button>
                  </div>
                ) : generated ? (
                  <>
                    {/* Product header */}
                    <div style={{ marginBottom:24, padding:"20px 24px", background:"rgba(255,107,53,0.07)", border:"1px solid rgba(255,107,53,0.2)", borderRadius:12 }}>
                      <div style={{ fontSize:11, color:"#ff6b35", fontWeight:600, marginBottom:6 }}>{selectedNiche?.label} · {selectedType?.label}</div>
                      <h2 style={{ margin:"0 0 6px", fontSize:22, fontWeight:800, fontFamily:"'Instrument Serif', serif", letterSpacing:"-0.3px" }}>
                        {generated.productTitle}
                      </h2>
                      <p style={{ margin:"0 0 14px", color:"#b8a898", fontSize:14 }}>{generated.tagline}</p>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        {[
                          { label:"Recommended Price", value:generated.recommendedPrice, color:"#ffd166" },
                          { label:"Estimated Monthly Income", value:generated.estimatedMonthlyIncome, color:"#a8e6cf" },
                        ].map(s => (
                          <div key={s.label} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 14px" }}>
                            <div style={{ fontSize:10, color:"#664433", marginBottom:2 }}>{s.label}</div>
                            <div style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display:"flex", gap:0, borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:20 }}>
                      {[
                        { id:"product", label:"📦 Product" },
                        { id:"etsy",    label:"🛍 Etsy Listing" },
                        { id:"gumroad", label:"🌐 Gumroad" },
                        { id:"strategy",label:"🚀 Strategy" },
                      ].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                          padding:"10px 16px", border:"none", background:"transparent", cursor:"pointer",
                          fontFamily:"'Syne', sans-serif", fontWeight:600, fontSize:12,
                          color: activeTab===t.id?"#ff6b35":"#555",
                          borderBottom: activeTab===t.id?"2px solid #ff6b35":"2px solid transparent",
                          transition:"all 0.15s",
                        }}>{t.label}</button>
                      ))}
                    </div>

                    {/* Tab: Product */}
                    {activeTab === "product" && (
                      <div className="fade-up">
                        <Section title="What's Included" action={<CopyBtn text={generated.productContents?.join("\n")} id="contents" copied={copied} onCopy={copy}/>}>
                          <ul style={{ margin:0, padding:"0 0 0 18px", display:"flex", flexDirection:"column", gap:6 }}>
                            {generated.productContents?.map((c,i) => (
                              <li key={i} style={{ fontSize:13, color:"#c8b8a8", lineHeight:1.5 }}>{c}</li>
                            ))}
                          </ul>
                        </Section>
                        <Section title="Content Outline" action={<CopyBtn text={generated.contentOutline?.join("\n")} id="outline" copied={copied} onCopy={copy}/>}>
                          <ol style={{ margin:0, padding:"0 0 0 18px", display:"flex", flexDirection:"column", gap:6 }}>
                            {generated.contentOutline?.map((c,i) => (
                              <li key={i} style={{ fontSize:13, color:"#c8b8a8", lineHeight:1.5 }}>{c}</li>
                            ))}
                          </ol>
                        </Section>
                        <Section title="Upsell / Bundle Idea" accent>
                          <p style={{ margin:0, fontSize:13, color:"#c8b8a8", lineHeight:1.6 }}>{generated.bundleIdea}</p>
                        </Section>
                      </div>
                    )}

                    {/* Tab: Etsy */}
                    {activeTab === "etsy" && (
                      <div className="fade-up">
                        <Section title="Etsy Title" action={<CopyBtn text={generated.etsyTitle} id="etsy-title" copied={copied} onCopy={copy}/>}>
                          <p style={{ margin:0, fontSize:13, color:"#c8b8a8", lineHeight:1.6, fontStyle:"italic" }}>{generated.etsyTitle}</p>
                        </Section>
                        <Section title="Etsy Description" action={<CopyBtn text={generated.etsyDescription} id="etsy-desc" copied={copied} onCopy={copy}/>}>
                          <p style={{ margin:0, fontSize:13, color:"#c8b8a8", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{generated.etsyDescription}</p>
                        </Section>
                        <Section title="Etsy Tags (13)" action={<CopyBtn text={generated.etsyTags?.join(", ")} id="etsy-tags" copied={copied} onCopy={copy}/>}>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                            {generated.etsyTags?.map((t,i) => (
                              <span key={i} style={{ padding:"4px 10px", borderRadius:20, background:"rgba(255,107,53,0.1)", border:"1px solid rgba(255,107,53,0.2)", fontSize:11, color:"#ff9a6b" }}>{t}</span>
                            ))}
                          </div>
                        </Section>
                        <Section title="SEO Keywords">
                          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                            {generated.seoKeywords?.map((k,i) => (
                              <span key={i} style={{ padding:"4px 10px", borderRadius:20, background:"rgba(255,209,102,0.08)", border:"1px solid rgba(255,209,102,0.2)", fontSize:11, color:"#ffd166" }}>{k}</span>
                            ))}
                          </div>
                        </Section>
                      </div>
                    )}

                    {/* Tab: Gumroad */}
                    {activeTab === "gumroad" && (
                      <div className="fade-up">
                        <Section title="Gumroad Product Blurb" action={<CopyBtn text={generated.gumroadBlurb} id="gumroad" copied={copied} onCopy={copy}/>}>
                          <p style={{ margin:0, fontSize:13, color:"#c8b8a8", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{generated.gumroadBlurb}</p>
                        </Section>
                        <Section title="Platform Tips" accent>
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {[
                              "Set price to "+generated.recommendedPrice+" — don't go lower than £5 or it signals low value",
                              "Add a preview PDF (first 10%) to build trust and reduce refunds",
                              "Use 'Pay what you want' with minimum £"+generated.recommendedPrice?.replace("£","")+" to let buyers tip more",
                              "Bundle 3–5 related products into a 'Vault' and price at 2× the individual price",
                            ].map((tip,i) => (
                              <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:"#c8b8a8", lineHeight:1.5 }}>
                                <span style={{ color:"#ff6b35", flexShrink:0 }}>→</span>{tip}
                              </div>
                            ))}
                          </div>
                        </Section>
                      </div>
                    )}

                    {/* Tab: Strategy */}
                    {activeTab === "strategy" && (
                      <div className="fade-up">
                        <Section title="Launch Strategy (First 10 Sales)">
                          <p style={{ margin:0, fontSize:13, color:"#c8b8a8", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{generated.launchStrategy}</p>
                        </Section>
                        <Section title="Income Projection" accent>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                            {[
                              { label:"Month 1", sub:"Getting listings live", value:"£0–£50" },
                              { label:"Month 2–3", sub:"Building SEO traction", value:"£50–£300" },
                              { label:"Month 4+", sub:"Passive compound income", value:generated.estimatedMonthlyIncome },
                            ].map(p => (
                              <div key={p.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"12px", textAlign:"center" }}>
                                <div style={{ fontSize:11, color:"#664433", marginBottom:4 }}>{p.label}</div>
                                <div style={{ fontSize:16, fontWeight:800, color:"#a8e6cf", fontFamily:"'Instrument Serif', serif" }}>{p.value}</div>
                                <div style={{ fontSize:10, color:"#444", marginTop:3 }}>{p.sub}</div>
                              </div>
                            ))}
                          </div>
                        </Section>
                        <Section title="What to do next">
                          {[
                            { step:"1", text:"Create the product using Claude, Canva, or Notion. The outline above is your blueprint." },
                            { step:"2", text:"List on "+selectedNiche?.platforms[0]+" using the exact title, description and tags from the Etsy tab." },
                            { step:"3", text:"Post 3× on Pinterest with keyword-rich descriptions linking to your listing — free SEO traffic." },
                            { step:"4", text:"Build the bundle idea above and list it at 2× the price. Bundles convert higher." },
                            { step:"5", text:"Repeat this workflow for 10–20 products. Each one compounds your passive income." },
                          ].map(s => (
                            <div key={s.step} style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
                              <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#ff6b35,#ffd166)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#1a0a00", flexShrink:0 }}>{s.step}</div>
                              <p style={{ margin:0, fontSize:13, color:"#c8b8a8", lineHeight:1.6 }}>{s.text}</p>
                            </div>
                          ))}
                        </Section>
                      </div>
                    )}

                    <div style={{ marginTop:24, display:"flex", gap:10 }}>
                      <button onClick={generate} style={btn(true,false)}>⚡ Regenerate</button>
                      <button onClick={reset} style={btn(false,false)}>New Product</button>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, children, action, accent }) {
  return (
    <div style={{ marginBottom:16, background: accent?"rgba(255,107,53,0.05)":"rgba(255,255,255,0.02)", border:`1px solid ${accent?"rgba(255,107,53,0.15)":"rgba(255,255,255,0.06)"}`, borderRadius:10, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color: accent?"#ff6b35":"#664433", letterSpacing:"0.5px" }}>{title.toUpperCase()}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function CopyBtn({ text, id, copied, onCopy }) {
  return (
    <button onClick={() => onCopy(text, id)} style={{
      padding:"4px 12px", borderRadius:6,
      border:`1px solid ${copied===id?"#a8e6cf":"rgba(255,255,255,0.12)"}`,
      background: copied===id?"rgba(168,230,207,0.12)":"rgba(255,255,255,0.04)",
      color: copied===id?"#a8e6cf":"#666", fontSize:11,
      cursor:"pointer", fontFamily:"'Syne', sans-serif", fontWeight:600,
      transition:"all 0.2s",
    }}>{copied===id?"✓ Copied":"Copy"}</button>
  );
}

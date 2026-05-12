import { useState, useEffect, useRef } from "react";

const CONFIGS = {
  ebook: {
    label: "eBook / Guide", icon: "📖",
    desc: "Full chapters, frameworks & actionable content",
    prompt: (t, n, a) => `You are an expert digital product creator. Write a complete premium eBook.
Title: "${t}" | Niche: ${n} | Audience: ${a}
Respond ONLY with raw JSON (no markdown, no fences):
{"subtitle":"...","introduction":"Full intro 250 words hooking reader and promising transformation","chapters":[{"number":1,"title":"...","summary":"one sentence","content":"Full 300 word chapter with tips, a named framework, and 3 action points prefixed with arrow"}],"conclusion":"150 word inspiring conclusion","bonusChecklist":["item1","item2","item3","item4","item5","item6","item7","item8"]}
Write exactly 6 chapters. Real content only, no placeholders.`,
  },
  prompts: {
    label: "AI Prompt Pack", icon: "🤖",
    desc: "50 curated prompts organised by category",
    prompt: (t, n, a) => `You are an expert prompt engineer. Create a premium AI Prompt Pack.
Title: "${t}" | Niche: ${n} | Audience: ${a}
Respond ONLY with raw JSON (no markdown, no fences):
{"subtitle":"...","introduction":"150 word how-to-use guide","categories":[{"name":"...","description":"...","prompts":[{"number":1,"title":"...","useCase":"one sentence","prompt":"Full detailed prompt with [VARIABLES] min 3 sentences","proTip":"..."}]}],"bonusTips":["tip1","tip2","tip3","tip4","tip5"]}
Write exactly 5 categories with 10 prompts each. Every prompt must be specific and immediately usable.`,
  },
  template: {
    label: "Notion Template", icon: "⚡",
    desc: "Database schemas, views, setup guide and workflows",
    prompt: (t, n, a) => `You are an expert Notion designer. Create a premium Notion template product.
Title: "${t}" | Niche: ${n} | Audience: ${a}
Respond ONLY with raw JSON (no markdown, no fences):
{"subtitle":"...","overview":"200 word overview","databases":[{"name":"...","purpose":"...","properties":[{"name":"...","type":"text","description":"..."}],"views":["view1","view2","view3"]}],"setupGuide":[{"step":1,"title":"...","instructions":"2-3 sentences"}],"workflows":[{"name":"...","description":"3-4 sentences"}],"proTips":["t1","t2","t3","t4","t5","t6"],"faq":[{"question":"...","answer":"2-3 sentences"}]}
4 databases with 6 properties each, 6 setup steps, 3 workflows, 4 FAQs.`,
  },
  printable: {
    label: "Printable / Planner", icon: "📋",
    desc: "Sections, trackers, prompts and instructions",
    prompt: (t, n, a) => `You are an expert digital planner creator. Write content for a premium printable planner.
Title: "${t}" | Niche: ${n} | Audience: ${a}
Respond ONLY with raw JSON (no markdown, no fences):
{"subtitle":"...","welcomeMessage":"150 word warm welcome","sections":[{"name":"...","pageCount":4,"purpose":"...","pageLayout":"...","prompts":["p1","p2","p3","p4","p5"]}],"dailyPageElements":["e1","e2","e3","e4","e5"],"trackers":[{"name":"...","description":"...","fields":["f1","f2","f3","f4"]}],"affirmations":["a1","a2","a3","a4","a5","a6"],"instructions":"150 word how-to-use guide"}
5 sections, 3 trackers. Everything niche-specific.`,
  },
};

function buildExport(type, d, title, subtitle) {
  var hr = "-----------------------------------------------";
  var o = title + "\n" + (subtitle || "") + "\n" + hr + "\n\n";
  if (type === "ebook") {
    o += "INTRODUCTION\n\n" + (d.introduction || "") + "\n\n" + hr + "\n\n";
    var chs = d.chapters || [];
    for (var i = 0; i < chs.length; i++) {
      o += "CHAPTER " + chs[i].number + ": " + chs[i].title + "\n" + chs[i].summary + "\n\n" + chs[i].content + "\n\n" + hr + "\n\n";
    }
    o += "CONCLUSION\n\n" + (d.conclusion || "") + "\n\nBONUS CHECKLIST\n\n";
    var bl = d.bonusChecklist || [];
    for (var j = 0; j < bl.length; j++) { o += "[ ] " + bl[j] + "\n"; }
  } else if (type === "prompts") {
    o += "HOW TO USE\n\n" + (d.introduction || "") + "\n\n" + hr + "\n\n";
    var cats = d.categories || [];
    for (var ci = 0; ci < cats.length; ci++) {
      o += cats[ci].name.toUpperCase() + "\n" + cats[ci].description + "\n\n";
      var ps = cats[ci].prompts || [];
      for (var pi = 0; pi < ps.length; pi++) {
        o += "#" + ps[pi].number + " " + ps[pi].title + "\nWhen: " + ps[pi].useCase + "\n\n" + ps[pi].prompt + "\nTip: " + ps[pi].proTip + "\n\n";
      }
      o += hr + "\n\n";
    }
    o += "BONUS TIPS\n\n";
    var bt = d.bonusTips || [];
    for (var bi = 0; bi < bt.length; bi++) { o += (bi + 1) + ". " + bt[bi] + "\n"; }
  } else if (type === "template") {
    o += "OVERVIEW\n\n" + (d.overview || "") + "\n\n" + hr + "\n\n";
    var dbs = d.databases || [];
    for (var di = 0; di < dbs.length; di++) {
      o += "DATABASE: " + dbs[di].name + "\n" + dbs[di].purpose + "\n\nProperties:\n";
      var props = dbs[di].properties || [];
      for (var pri = 0; pri < props.length; pri++) { o += "  [" + props[pri].type + "] " + props[pri].name + " - " + props[pri].description + "\n"; }
      o += "\nViews:\n";
      var views = dbs[di].views || [];
      for (var vi = 0; vi < views.length; vi++) { o += "  -> " + views[vi] + "\n"; }
      o += "\n" + hr + "\n\n";
    }
    o += "SETUP GUIDE\n\n";
    var sg = d.setupGuide || [];
    for (var si = 0; si < sg.length; si++) { o += "Step " + sg[si].step + ": " + sg[si].title + "\n" + sg[si].instructions + "\n\n"; }
    o += "\nWORKFLOWS\n\n";
    var wf = d.workflows || [];
    for (var wi = 0; wi < wf.length; wi++) { o += wf[wi].name + "\n" + wf[wi].description + "\n\n"; }
  } else if (type === "printable") {
    o += "WELCOME\n\n" + (d.welcomeMessage || "") + "\n\n" + hr + "\n\n";
    var secs = d.sections || [];
    for (var xi = 0; xi < secs.length; xi++) {
      o += "SECTION: " + secs[xi].name.toUpperCase() + "\n" + secs[xi].purpose + "\n\n";
      var sp = secs[xi].prompts || [];
      for (var xp = 0; xp < sp.length; xp++) { o += "  * " + sp[xp] + "\n"; }
      o += "\n" + hr + "\n\n";
    }
    o += "AFFIRMATIONS\n\n";
    var affs = d.affirmations || [];
    for (var ai = 0; ai < affs.length; ai++) { o += '"' + affs[ai] + '"\n'; }
    o += "\nHOW TO USE\n\n" + (d.instructions || "");
  }
  return o;
}

function Sec(props) {
  return (
    <div style={{ marginBottom: 16, background: props.accent ? "rgba(255,107,53,0.04)" : "rgba(255,255,255,0.02)", border: "1px solid " + (props.accent ? "rgba(255,107,53,0.18)" : "rgba(255,255,255,0.06)"), borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: props.accent ? "#ff6b35" : "#553322", letterSpacing: 1, marginBottom: 10 }}>{props.title.toUpperCase()}</div>
      {props.children}
    </div>
  );
}

function CBtn(props) {
  var ok = props.copied === props.id;
  return (
    <button onClick={function() { props.onCopy(props.text, props.id); }} style={{ padding: "4px 11px", borderRadius: 6, border: "1px solid " + (ok ? "#a8e6cf" : "rgba(255,255,255,0.1)"), background: ok ? "rgba(168,230,207,0.1)" : "rgba(255,255,255,0.03)", color: ok ? "#a8e6cf" : "#665544", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
      {ok ? "Copied!" : (props.label || "Copy")}
    </button>
  );
}

function EbookView(props) {
  var d = props.d;
  return (
    <div>
      <Sec title="Introduction" accent={true}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><CBtn text={d.introduction} id="intro" copied={props.copied} onCopy={props.onCopy} /></div>
        <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{d.introduction}</p>
      </Sec>
      {(d.chapters || []).map(function(ch, i) {
        return (
          <Sec key={i} title={"Chapter " + ch.number + ": " + ch.title}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#553322", fontStyle: "italic" }}>{ch.summary}</p>
              <CBtn text={ch.content} id={"ch" + i} copied={props.copied} onCopy={props.onCopy} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{ch.content}</p>
          </Sec>
        );
      })}
      <Sec title="Conclusion" accent={true}>
        <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{d.conclusion}</p>
      </Sec>
      <Sec title="Bonus Checklist">
        <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
          {(d.bonusChecklist || []).map(function(item, i) {
            return <li key={i} style={{ fontSize: 13, color: "#c8b8a8", lineHeight: 1.8 }}>{item}</li>;
          })}
        </ul>
      </Sec>
    </div>
  );
}

function PromptsView(props) {
  var d = props.d;
  return (
    <div>
      <Sec title="How To Use" accent={true}>
        <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9 }}>{d.introduction}</p>
      </Sec>
      {(d.categories || []).map(function(cat, ci) {
        return (
          <Sec key={ci} title={cat.name}>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#553322" }}>{cat.description}</p>
            {(cat.prompts || []).map(function(p, pi) {
              return (
                <div key={pi} style={{ marginBottom: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>#{p.number} {p.title}</span>
                    <CBtn text={p.prompt} id={"p" + ci + "-" + pi} copied={props.copied} onCopy={props.onCopy} label="Copy" />
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#553322", fontStyle: "italic" }}>{p.useCase}</p>
                  <div style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 6, padding: "10px 12px", marginBottom: 6 }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#d4a882", lineHeight: 1.7, fontFamily: "monospace" }}>{p.prompt}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "#665544" }}>Tip: {p.proTip}</p>
                </div>
              );
            })}
          </Sec>
        );
      })}
    </div>
  );
}

function TemplateView(props) {
  var d = props.d;
  return (
    <div>
      <Sec title="Overview" accent={true}>
        <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9 }}>{d.overview}</p>
      </Sec>
      {(d.databases || []).map(function(db, di) {
        return (
          <Sec key={di} title={"Database: " + db.name}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#553322" }}>{db.purpose}</p>
            {(db.properties || []).map(function(prop, pi) {
              return (
                <div key={pi} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(127,204,255,0.1)", color: "#7fccff", fontWeight: 700, flexShrink: 0 }}>{prop.type}</span>
                  <span style={{ fontSize: 12, color: "#c8b8a8" }}>{prop.name} — {prop.description}</span>
                </div>
              );
            })}
          </Sec>
        );
      })}
      <Sec title="Setup Guide">
        {(d.setupGuide || []).map(function(s, i) {
          return (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b35,#ffd166)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#1a0a00", flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#c8b8a8", lineHeight: 1.6 }}>{s.instructions}</div>
              </div>
            </div>
          );
        })}
      </Sec>
      <Sec title="Workflows" accent={true}>
        {(d.workflows || []).map(function(w, i) {
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#ffd166" }}>{w.name}</div>
              <div style={{ fontSize: 12, color: "#c8b8a8", lineHeight: 1.7 }}>{w.description}</div>
            </div>
          );
        })}
      </Sec>
    </div>
  );
}

function PrintableView(props) {
  var d = props.d;
  return (
    <div>
      <Sec title="Welcome Message" accent={true}>
        <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9 }}>{d.welcomeMessage}</p>
      </Sec>
      {(d.sections || []).map(function(s, i) {
        return (
          <Sec key={i} title={"Section: " + s.name}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#c8b8a8" }}>{s.purpose}</p>
            {(s.prompts || []).map(function(p, pi) {
              return <div key={pi} style={{ fontSize: 12, color: "#c8b8a8", marginBottom: 5 }}>* {p}</div>;
            })}
          </Sec>
        );
      })}
      {(d.trackers || []).map(function(tr, i) {
        return (
          <Sec key={i} title={"Tracker: " + tr.name}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#c8b8a8" }}>{tr.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(tr.fields || []).map(function(f, fi) {
                return <span key={fi} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "rgba(168,230,207,0.1)", color: "#a8e6cf", fontWeight: 700 }}>{f}</span>;
              })}
            </div>
          </Sec>
        );
      })}
      <Sec title="Affirmations" accent={true}>
        {(d.affirmations || []).map(function(a, i) {
          return <div key={i} style={{ fontSize: 13, color: "#c8b8a8", fontStyle: "italic", marginBottom: 6 }}>"{a}"</div>;
        })}
      </Sec>
      <Sec title="How To Use">
        <p style={{ margin: 0, fontSize: 13, color: "#c8b8a8", lineHeight: 1.9 }}>{d.instructions}</p>
      </Sec>
    </div>
  );
}

export default function Generator() {
  var s = useState("");
  var type = s[0]; var setType = s[1];
  var s2 = useState(""); var title = s2[0]; var setTitle = s2[1];
  var s3 = useState(""); var niche = s3[0]; var setNiche = s3[1];
  var s4 = useState(""); var audience = s4[0]; var setAudience = s4[1];
  var s5 = useState(false); var busy = s5[0]; var setBusy = s5[1];
  var s6 = useState(0); var pct = s6[0]; var setPct = s6[1];
  var s7 = useState(""); var pLabel = s7[0]; var setPLabel = s7[1];
  var s8 = useState(null); var result = s8[0]; var setResult = s8[1];
  var s9 = useState(""); var err = s9[0]; var setErr = s9[1];
  var s10 = useState("preview"); var tab = s10[0]; var setTab = s10[1];
  var s11 = useState(""); var copied = s11[0]; var setCopied = s11[1];
  var s12 = useState([]); var history = s12[0]; var setHistory = s12[1];
  var top = useRef(null);

  useEffect(function() {
    var el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap";
    document.head.appendChild(el);
    return function() { try { document.head.removeChild(el); } catch(e) {} };
  }, []);

  function copy(text, id) {
    navigator.clipboard.writeText(text || "");
    setCopied(id);
    setTimeout(function() { setCopied(""); }, 2000);
  }

  function reset() { setResult(null); setErr(""); setPct(0); }

  function generate() {
    if (!type || !title.trim()) return;
    setBusy(true);
    setResult(null);
    setErr("");
    setPct(5);
    setPLabel("Thinking...");

    var milestones = [[20,"Planning structure..."],[45,"Writing content..."],[70,"Adding depth..."],[88,"Polishing..."],[96,"Almost done..."]];
    var mi = 0;
    var tick = setInterval(function() {
      if (mi < milestones.length) { setPct(milestones[mi][0]); setPLabel(milestones[mi][1]); mi++; }
    }, 1400);

    var cfg = CONFIGS[type];
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: cfg.prompt(title, niche || "General", audience || "General audience") }] }],
          generationConfig: { maxOutputTokens: 8000 },
        }),
      }
    )
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log("[Gemini Generator] key present:", !!import.meta.env.VITE_GEMINI_KEY);
      console.log("[Gemini Generator] response:", JSON.stringify(data, null, 2));
      var raw = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) ? data.candidates[0].content.parts[0].text : "{}";
      var clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      var parsed = JSON.parse(clean);
      clearInterval(tick);
      setPct(100);
      setPLabel("Done!");
      setTimeout(function() {
        setResult(Object.assign({}, parsed, { _type: type, _title: title, _niche: niche }));
        setHistory(function(h) { return [{ type: type, title: title, data: parsed, ts: Date.now() }].concat(h.slice(0, 7)); });
        setBusy(false);
        setTab("preview");
        if (top.current) top.current.scrollIntoView({ behavior: "smooth" });
      }, 400);
    })
    .catch(function() {
      clearInterval(tick);
      setErr("Generation failed - please try again.");
      setBusy(false);
    });
  }

  var cfg = CONFIGS[type] || null;
  var exportText = result ? buildExport(result._type, result, result._title, result.subtitle || "") : "";
  var canGenerate = type && title.trim();

  return (
    <div style={{ minHeight: "100vh", background: "#0d0905", color: "#e8ddd5", fontFamily: "Syne, sans-serif", backgroundImage: "radial-gradient(ellipse at 15% 10%, rgba(255,107,53,0.07) 0%, transparent 55%)" }}>
      <style>{"\
        @keyframes spin { to { transform: rotate(360deg); } }\
        @keyframes fi { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }\
        .fi { animation: fi 0.35s ease forwards; }\
        ::-webkit-scrollbar { width: 3px; }\
        ::-webkit-scrollbar-thumb { background: rgba(255,107,53,0.3); border-radius: 3px; }\
      "}</style>

      <div ref={top} style={{ borderBottom: "1px solid rgba(255,107,53,0.12)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,9,5,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#ff6b35,#ffd166)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Product Content Generator</div>
            <div style={{ fontSize: 10, color: "#553322", fontWeight: 600 }}>WRITE ONCE · SELL FOREVER</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {result && (
            <button onClick={reset} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#887766", cursor: "pointer", fontSize: 12 }}>
              New Product
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "26px 18px" }}>

        {!result && !busy && (
          <div className="fi">
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.4px" }}>What product do you want to create?</h1>
            <p style={{ margin: "0 0 24px", color: "#553322", fontSize: 13 }}>The AI writes the complete, sellable content ready to export as a PDF or Notion page.</p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#553322", letterSpacing: 1, marginBottom: 10 }}>PRODUCT FORMAT</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 8 }}>
                {Object.keys(CONFIGS).map(function(k) {
                  var c = CONFIGS[k];
                  return (
                    <div key={k} onClick={function() { setType(k); }}
                      style={{ border: "1.5px solid " + (type === k ? "#ff6b35" : "rgba(255,255,255,0.07)"), borderRadius: 9, padding: "13px 14px", cursor: "pointer", background: type === k ? "rgba(255,107,53,0.07)" : "rgba(255,255,255,0.015)", transition: "border-color 0.15s" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: "#553322", lineHeight: 1.4 }}>{c.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#553322", letterSpacing: 1, marginBottom: 7 }}>PRODUCT TITLE *</div>
                <input value={title} onChange={function(e) { setTitle(e.target.value); }} placeholder="e.g. Golden Retriever Breeder Notion System"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#e8ddd5", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#553322", letterSpacing: 1, marginBottom: 7 }}>NICHE / TOPIC</div>
                  <input value={niche} onChange={function(e) { setNiche(e.target.value); }} placeholder="e.g. Dog breeding"
                    style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#e8ddd5", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#553322", letterSpacing: 1, marginBottom: 7 }}>TARGET AUDIENCE</div>
                  <input value={audience} onChange={function(e) { setAudience(e.target.value); }} placeholder="e.g. First-time breeders"
                    style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#e8ddd5", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
                </div>
              </div>
            </div>

            <button onClick={generate} disabled={!canGenerate}
              style={{ padding: "12px 26px", borderRadius: 8, border: "none", cursor: canGenerate ? "pointer" : "not-allowed", fontWeight: 800, fontSize: 13, background: canGenerate ? "linear-gradient(135deg,#ff6b35,#ffd166)" : "rgba(255,255,255,0.06)", color: canGenerate ? "#1a0a00" : "#444", opacity: canGenerate ? 1 : 0.5 }}>
              Generate Complete Product
            </button>
            {err && <div style={{ marginTop: 12, color: "#ff6b6b", fontSize: 13 }}>{err}</div>}
          </div>
        )}

        {busy && (
          <div className="fi" style={{ textAlign: "center", padding: "70px 20px" }}>
            <div style={{ width: 46, height: 46, border: "3px solid rgba(255,107,53,0.15)", borderTopColor: "#ff6b35", borderRadius: "50%", margin: "0 auto 22px", animation: "spin 0.9s linear infinite" }} />
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Writing your product...</div>
            <div style={{ fontSize: 13, color: "#553322", marginBottom: 26 }}>{pLabel}</div>
            <div style={{ width: "100%", maxWidth: 340, margin: "0 auto", height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#ff6b35,#ffd166)", borderRadius: 4, width: pct + "%", transition: "width 0.7s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "#443322", marginTop: 8 }}>{pct}%</div>
          </div>
        )}

        {result && !busy && (
          <div className="fi">
            <div style={{ marginBottom: 20, padding: "16px 20px", background: "rgba(255,107,53,0.07)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: "#ff6b35", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
                {cfg && cfg.icon} {cfg && cfg.label}
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>{result._title}</h2>
              {result.subtitle && <p style={{ margin: 0, color: "#887766", fontSize: 13, fontStyle: "italic" }}>{result.subtitle}</p>}
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 18 }}>
              {[{id:"preview",label:"Preview"},{id:"export",label:"Export Text"}].map(function(t) {
                return (
                  <button key={t.id} onClick={function() { setTab(t.id); }} style={{ padding: "9px 16px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 700, fontSize: 12, color: tab === t.id ? "#ff6b35" : "#443322", borderBottom: tab === t.id ? "2px solid #ff6b35" : "2px solid transparent" }}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {tab === "preview" && (
              <div>
                {result._type === "ebook" && <EbookView d={result} copied={copied} onCopy={copy} />}
                {result._type === "prompts" && <PromptsView d={result} copied={copied} onCopy={copy} />}
                {result._type === "template" && <TemplateView d={result} copied={copied} onCopy={copy} />}
                {result._type === "printable" && <PrintableView d={result} />}
              </div>
            )}

            {tab === "export" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "#553322" }}>Paste into Google Docs or Notion, then export as PDF:</span>
                  <CBtn text={exportText} id="all" copied={copied} onCopy={copy} label="Copy All" />
                </div>
                <textarea readOnly value={exportText} rows={28}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#a89888", fontSize: 12, lineHeight: 1.7, fontFamily: "monospace", boxSizing: "border-box", outline: "none" }} />
                <div style={{ marginTop: 12, padding: "13px 15px", background: "rgba(255,209,102,0.04)", border: "1px solid rgba(255,209,102,0.15)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ffd166", marginBottom: 7 }}>NEXT STEPS</div>
                  <div style={{ fontSize: 12, color: "#c8b8a8", marginBottom: 5 }}>1. Paste into Google Docs, download as PDF, upload to Etsy or Gumroad</div>
                  <div style={{ fontSize: 12, color: "#c8b8a8", marginBottom: 5 }}>2. Paste into Canva Doc, add branding, download as styled PDF</div>
                  <div style={{ fontSize: 12, color: "#c8b8a8" }}>3. Paste into Notion, share as template, sell access link</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
              <button onClick={generate} style={{ padding: "11px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: "linear-gradient(135deg,#ff6b35,#ffd166)", color: "#1a0a00" }}>
                Regenerate
              </button>
              <button onClick={reset} style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#887766", cursor: "pointer", fontSize: 12 }}>
                New Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

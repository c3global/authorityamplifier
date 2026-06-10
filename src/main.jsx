import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const languages = ['Arabic','Bengali','Chinese (Mandarin)','Chinese (Cantonese)','Dutch','French','German','Hindi','Indonesian','Italian','Japanese','Korean','Persian/Farsi','Polish','Portuguese (Brazil)','Portuguese (Portugal)','Russian','Spanish','Swahili','Tagalog','Thai','Turkish','Ukrainian','Urdu','Vietnamese','Other'];
const challenges = ['Hesitating before I speak in meetings','Losing confidence when challenged or questioned','Sounding less intelligent than I actually am','Struggling with presentations to senior leadership','Handling unexpected Q&A moments','Navigating disagreements professionally','Communicating my expertise clearly under pressure'];

const baseProfile = { firstName: '', title: '', industry: '', nativeLanguage: '', challenge: '' };

const tools = [
  {
    id: 'translator', label: 'Confidence Translator', cta: 'Translate to Authority', outputLabel: 'YOUR AUTHORITY TRANSLATION',
    initial: { type: 'Email', text: '' },
    render: ({ state, setState }) => <>
      <Field label="Communication Type"><select value={state.type} onChange={e=>setState({...state,type:e.target.value})}>{['Email','Meeting-Verbal','Presentation','Written Report','Negotiation','Q&A Response'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Original Message"><textarea value={state.text} onChange={e=>setState({...state,text:e.target.value})} placeholder="Paste your message here..." /></Field>
    </>,
    valid: s => s.text.trim(),
    system: `Task: Transform the user's message into authoritative executive-level English.\n\nRespond in exactly this structure:\n\n**UPGRADED VERSION:**\n[Rewritten message — keep the user's voice, elevate the authority]\n\n**WHAT I CHANGED AND WHY:**\n• [Specific phrase swapped → why it adds authority]\n• [Specific phrase swapped → why it adds authority]\n• [Third change if applicable]\n\n**AUTHORITY LEVEL:** Before [X]/10 → After [X]/10\n[One sentence explaining the shift]`,
    user: s => `Context: ${s.type || 'General professional'}\n\nMy original message:\n"${s.text}"\n\nPlease upgrade this.`
  },
  {
    id: 'meeting', label: 'Meeting Prep Assistant', cta: 'Build My Meeting Prep', outputLabel: 'YOUR MEETING PREP',
    initial: { type: 'Internal team meeting', notes: '' },
    render: ({ state, setState }) => <>
      <Field label="Meeting Type"><select value={state.type} onChange={e=>setState({...state,type:e.target.value})}>{['Internal team meeting','1:1 with my manager','Executive-leadership presentation','Client meeting','Negotiation','Performance review','Cross-cultural meeting'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Notes / Points to Cover"><textarea value={state.notes} onChange={e=>setState({...state,notes:e.target.value})} placeholder="Paste messy notes here..." /></Field>
    </>,
    valid: s => s.notes.trim(),
    system: `Task: Transform the user's messy notes into a structured, authoritative meeting preparation guide.\n\nFormat as:\n\n**OPENING STATEMENT:**\n[A powerful 2–3 sentence opener they can use verbatim]\n\n**KEY TALKING POINTS:**\n1. [Point with authoritative framing]\n2. [Point with authoritative framing]\n3. [Point with authoritative framing]\n(Add 4–5 only if clearly needed from their notes)\n\n**POWER PHRASE:**\n[One memorable phrase to anchor themselves under pressure]\n\n**STRONG CLOSE:**\n[A closing statement or call to action]`,
    user: s => `Meeting type: ${s.type || 'Professional meeting'}\n\nMy notes:\n${s.notes}\n\nTransform this into a meeting prep guide.`
  },
  {
    id: 'recovery', label: 'Recovery Coach', cta: 'Get My Recovery Plan', outputLabel: 'YOUR RECOVERY PLAN',
    initial: { happened: '' },
    render: ({ state, setState }) => <Field label="What Happened?" hint="Be specific. The more detail you give, the more precise your recovery plan will be."><textarea className="tall" value={state.happened} onChange={e=>setState({...state,happened:e.target.value})} placeholder="Describe the situation..." /></Field>,
    valid: s => s.happened.trim(),
    system: `Task: Help the user recover from a communication challenge with practical, real-world language.\n\nFormat as:\n\n**IF YOU'RE STILL IN THE CONVERSATION:**\n[Exact language to use right now — natural, short, no apology]\n\n**HOW TO FOLLOW UP:**\n[A ready-to-send email or message they can use to reinforce authority]\n\n**YOUR POWER PHRASE FOR NEXT TIME:**\n[One memorizable phrase for when this situation occurs again — something that sounds natural under pressure]\n\n**THE ROOT CAUSE:**\n[One sentence identifying what actually happened — framed as insight, not shame. E.g. "You were translating rather than expressing."]`,
    user: s => `Here's what happened:\n${s.happened}\n\nHelp me recover and handle this better next time.`
  },
  {
    id: 'frameworks', label: 'Mini-Frameworks', cta: 'Get My Framework', outputLabel: 'YOUR COMMUNICATION FRAMEWORK',
    initial: { scenario: '', context: '' },
    render: ({ state, setState }) => <>
      <div className="gridCards">{['Presenting data to senior leadership','Disagreeing with a colleague or manager','Interrupting politely to make a point','Asking for a promotion or raise','Handling criticism or pushback','Giving difficult feedback','Introducing yourself powerfully','Closing a negotiation','Recovering after being interrupted','Responding to "Tell me about yourself"'].map(x=><button type="button" className={state.scenario===x?'card active':'card'} onClick={()=>setState({...state,scenario:x})} key={x}>{x}</button>)}</div>
      <Field label="Additional Context" hint="Optional"><input value={state.context} onChange={e=>setState({...state,context:e.target.value})} placeholder="Add context if useful..." /></Field>
    </>,
    valid: s => s.scenario,
    system: `Task: Give a powerful, memorable communication framework for the chosen scenario. This is elite coaching — not corporate-speak.\n\nFormat as:\n\n**THE FRAMEWORK:**\n[Name it with a short, memorable label — e.g. "The 3-Part Bridge" or "The Pause-Pivot-Proceed". Lay out the numbered steps with a brief explanation of each.]\n\n**FILL-IN-THE-BLANK TEMPLATE:**\n[Ready-to-use template with clear placeholders like [topic], [concern], [recommendation]]\n\n**EXAMPLE:**\n[A concrete example tailored to the user's specific industry using the template above]\n\n**AUTHORITY NOTES:**\n• [What makes this framework powerful for multilingual professionals specifically]\n• [A common pitfall this framework helps them avoid]\n• [One delivery tip]`,
    user: s => `Scenario: ${s.scenario}\n${s.context ? `Additional context: ${s.context}\n` : ''}\nGive me the framework.`
  },
  {
    id: 'pitch', label: 'Elevator Pitch Builder', cta: 'Build My Pitch', outputLabel: 'YOUR AUTHORITY PITCH',
    initial: { what: '', who: '', win: '', setting: 'General networking event' },
    render: ({ state, setState }) => <>
      <Field label="What You Do"><input value={state.what} onChange={e=>setState({...state,what:e.target.value})} /></Field>
      <Field label="Who You Help / Serve"><input value={state.who} onChange={e=>setState({...state,who:e.target.value})} /></Field>
      <Field label="A Key Result or Win" hint="Optional but powerful"><input value={state.win} onChange={e=>setState({...state,win:e.target.value})} /></Field>
      <Field label="Setting"><select value={state.setting} onChange={e=>setState({...state,setting:e.target.value})}>{['General networking event','International conference','Executive leadership meeting','LinkedIn or online intro','Job interview','First meeting with a potential client','Cross-cultural team introduction'].map(x=><option key={x}>{x}</option>)}</select></Field>
    </>,
    valid: s => s.what.trim() && s.who.trim(),
    system: `Task: Build a powerful professional introduction that sounds natural when spoken — not memorized, not robotic.\n\nFormat as:\n\n**YOUR 30-SECOND VERSION:**\n[Natural spoken intro — powerful, with a hook. Write it to be spoken, not read.]\n\n**YOUR 60-SECOND VERSION:**\n[Extends with one story beat, one specific result, one invitation to connect]\n\n**YOUR MEMORABLE CLOSE:**\n[One sentence that makes people want to continue the conversation]\n\n**DELIVERY NOTES FOR MULTILINGUAL SPEAKERS:**\n• [What to lean into — how their background or accent can become an asset here]\n• [A specific pacing or pause tip]\n• [What to avoid that quietly undermines presence]`,
    user: s => `What I do: ${s.what}\nWho I help: ${s.who}\nKey result/win: ${s.win || 'not provided'}\nSetting: ${s.setting || 'not specified'}\n\nBuild my pitch.`
  },
  {
    id: 'audit', label: 'Authority Audit', cta: 'Run Authority Audit', outputLabel: 'YOUR AUTHORITY AUDIT',
    initial: { sample: '' },
    render: ({ state, setState }) => <Field label="Communication Sample" hint="Paste an email, presentation intro, or something you said verbatim in a meeting."><textarea className="tall" value={state.sample} onChange={e=>setState({...state,sample:e.target.value})} /></Field>,
    valid: s => s.sample.trim(),
    system: `Task: Perform a full authority audit on the user's communication sample. Be specific, direct, and constructive — like a trusted coach reviewing tape.\n\nFormat as:\n\n**AUTHORITY SCORE:** [X/10]\n\n**WHAT'S WORKING:**\n• [Strength 1 — quote the phrase + explain why it works]\n• [Strength 2 — quote the phrase + explain why it works]\n\n**WHAT'S UNDERMINING YOU:**\n• [Issue 1 — quote the exact phrase + explain the impact on how they're perceived]\n• [Issue 2 — quote the exact phrase + explain the impact]\n• [Issue 3 if present]\n\n**THE UPGRADED VERSION:**\n[The same communication, fully rewritten with authority]\n\n**YOUR #1 COACHING FOCUS:**\n[The single most important habit to change — and why it will have the biggest impact for a multilingual professional specifically]`,
    user: s => `Please audit this communication sample for authority:\n\n"${s.sample}"`
  }
];

function App() {
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('aa_profile') || 'null'));
  const complete = profile && Object.values(profile).every(Boolean);
  if (!complete) return <ProfileSetup onComplete={p => { localStorage.setItem('aa_profile', JSON.stringify(p)); setProfile(p); }} />;
  return <MainApp profile={profile} resetProfile={() => { localStorage.removeItem('aa_profile'); setProfile(null); }} />;
}

function ProfileSetup({ onComplete }) {
  const [profile, setProfile] = useState(baseProfile);
  const ready = Object.values(profile).every(v => v.trim());
  const update = (k,v) => setProfile(p => ({...p,[k]:v}));
  const save = () => { if (ready) onComplete(profile); };
  return <main className="setup"><section className="setupCard"><p className="eyebrow">Authority Amplifier™</p><h1>Enter the Authority Room</h1><p className="lead">Set your private coaching profile once. Every response will be calibrated to your role, industry, language background, and communication challenge.</p>
    <Field label="First Name"><input value={profile.firstName} onChange={e=>update('firstName',e.target.value)} placeholder="What should we call you?" /></Field>
    <Field label="Title / Role"><input value={profile.title} onChange={e=>update('title',e.target.value)} placeholder="e.g. VP of Operations, Senior Manager, Director" /></Field>
    <Field label="Industry"><input value={profile.industry} onChange={e=>update('industry',e.target.value)} placeholder="e.g. Finance, Technology, Healthcare" /></Field>
    <Field label="Native Language"><select value={profile.nativeLanguage} onChange={e=>update('nativeLanguage',e.target.value)}><option value="">Select language</option>{languages.map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Biggest Challenge"><select value={profile.challenge} onChange={e=>update('challenge',e.target.value)}><option value="">Select challenge</option>{challenges.map(x=><option key={x}>{x}</option>)}</select></Field>
    <button className="primary full" disabled={!ready} onClick={save}>Enter the Authority Room →</button>
  </section></main>;
}

function MainApp({ profile, resetProfile }) {
  const [active, setActive] = useState(tools[0].id);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('aa_rewriter_unlocked') === 'yes');
  const tool = tools.find(t => t.id === active);
  return <div className="shell"><aside className="sidebar"><div><p className="brandSmall">C3 Global</p><h2>Authority Amplifier™</h2><p className="mini">Private AI communication coaching</p><nav>{tools.map(t=><button key={t.id} onClick={()=>setActive(t.id)} className={active===t.id?'nav active':'nav'}>{t.label}</button>)}<p className="navDivider">Premium Add-On</p><button onClick={()=>setActive('rewriter')} className={active==='rewriter'?'nav active':'nav'}>Authority Rewriter™{unlocked ? '' : ' 🔒'}</button></nav></div><footer><p>{profile.firstName} · {profile.title}</p><button className="linkBtn" onClick={resetProfile}>Reset profile</button></footer></aside>{active === 'rewriter' ? <RewriterView profile={profile} unlocked={unlocked} onUnlock={()=>{ localStorage.setItem('aa_rewriter_unlocked','yes'); setUnlocked(true); }} /> : <ToolView key={tool.id} tool={tool} profile={profile} />}</div>;
}

function ToolView({ tool, profile }) {
  const [state, setState] = useState(tool.initial);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const baseSystem = useMemo(() => `You are an elite executive communication coach for multilingual professionals.\nYour client is ${profile.firstName}, a ${profile.title} in the ${profile.industry} industry.\nTheir native language is ${profile.nativeLanguage}.\nTheir primary communication challenge is: ${profile.challenge}.\nBe like a trusted elite private coach — direct, warm, and highly competent.\nNever open with "Certainly!", "Great question!", or similar filler. Go straight to value.\nFormat clearly using bold headers.`, [profile]);
  async function generate() {
    setLoading(true); setError(''); setOutput('');
    try {
      const res = await fetch('/.netlify/functions/claude', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ systemPrompt: `${baseSystem}\n\n${tool.system}`, userPrompt: tool.user(state) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection error');
      setOutput(data.text);
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  }
  return <main className="content"><div className="top"><p className="eyebrow">Authority Tool</p><h1>{tool.label}</h1></div><section className="panel">{tool.render({ state, setState })}<div className="actions"><button className="primary" disabled={!tool.valid(state) || loading} onClick={generate}>{tool.cta}</button><button className="secondary" onClick={()=>{setState(tool.initial); setOutput(''); setError('');}}>Clear</button></div>{loading && <div className="loading"><span></span><span></span><span></span> Your coach is thinking...</div>}{error && <p className="error">{error}</p>}{output && <Output label={tool.outputLabel} text={output} />}</section></main>;
}

const docTypes = ['Email','Proposal','Presentation notes / slide talking points','Meeting comments / verbal statement','Performance review self-assessment','Executive summary','LinkedIn message or connection note'];
const rewriteStyles = ['EXECUTIVE','DIPLOMATIC','DIRECT','PERSUASIVE','CULTURALLY INTELLIGENT','COACHING NOTE'];

function RewriterView({ profile, unlocked, onUnlock }) {
  if (!unlocked) return <UnlockGate onUnlock={onUnlock} />;
  return <RewriterTool profile={profile} />;
}

function UnlockGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  async function check() {
    setChecking(true); setError('');
    try {
      const res = await fetch('/.netlify/functions/claude', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ action:'unlock', code }) });
      const data = await res.json();
      if (data.ok) onUnlock();
      else setError('That code doesn’t match. Check your purchase email and try again.');
    } catch { setError('Connection error. Please try again.'); }
    finally { setChecking(false); }
  }
  return <main className="content"><div className="top"><p className="eyebrow">Premium Add-On</p><h1>Authority Rewriter™</h1></div><section className="panel">
    <p className="lead">Paste one professional message and receive five authority-calibrated rewrites — Executive, Diplomatic, Direct, Persuasive, and the Culturally Intelligent version no generic AI offers. Enter the access code from your purchase email to unlock.</p>
    <Field label="Access Code"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter your access code" /></Field>
    <div className="actions"><button className="primary" disabled={!code.trim() || checking} onClick={check}>{checking ? 'Checking...' : 'Unlock the Rewriter'}</button></div>
    {error && <p className="error">{error}</p>}
  </section></main>;
}

function RewriterTool({ profile }) {
  const [form, setForm] = useState({ docType: 'Email', content: '' });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function generate() {
    setLoading(true); setError(''); setOutput('');
    const systemPrompt = `You are an elite executive communication coach and cultural intelligence expert with 20+ years of experience coaching multilingual professionals in global organizations.\n\nYour client is ${profile.firstName}, a ${profile.title} in the ${profile.industry} industry. Their native language is ${profile.nativeLanguage}.\n\nTask: Rewrite the user's professional communication in five distinct styles. Each version must be substantively different — not just slightly reworded. Each one should feel like it was written by a different strategic communicator with a specific goal in mind.\n\nFormat as:\n\n---\n**EXECUTIVE**\n[Purpose: Commands authority and signals senior-level thinking. Uses precise, confident language. No hedging. Structured for decision-makers who read fast.]\n[Rewritten version]\n\n---\n**DIPLOMATIC**\n[Purpose: Achieves the goal while preserving relationships and saving face. Warm but firm. Uses language that opens doors rather than closing them.]\n[Rewritten version]\n\n---\n**DIRECT**\n[Purpose: Gets to the point immediately. No preamble, no softening. Respects the reader's time. Best for confident internal communication.]\n[Rewritten version]\n\n---\n**PERSUASIVE**\n[Purpose: Moves the reader toward a decision or action. Uses evidence, logic, and subtle urgency. Frames the message around the reader's interests.]\n[Rewritten version]\n\n---\n**CULTURALLY INTELLIGENT**\n[Purpose: Written for a cross-cultural or international audience. Considers face-saving, relationship-first communication norms, avoids idioms or culture-specific references, and adapts assertiveness level for global readability. This is not a generic "professional" rewrite — it is specifically designed for high-context communication environments.]\n[Rewritten version]\n\nAfter all five versions, add:\n\n**COACHING NOTE:**\n[2–3 sentences on which version is recommended for the user's specific situation and why — and one phrase from the original that was the biggest authority leak]`;
    const userPrompt = `Document type: ${form.docType}\n\nOriginal content:\n"${form.content}"\n\nPlease provide all five rewrites.`;
    try {
      const res = await fetch('/.netlify/functions/claude', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ systemPrompt, userPrompt, maxTokens: 4000 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection error');
      setOutput(data.text);
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  }
  return <main className="content"><div className="top"><p className="eyebrow">Premium Add-On</p><h1>Authority Rewriter™</h1></div><section className="panel">
    <p className="lead">Paste one professional message. Receive five authority-calibrated rewrites with a culturally intelligent version built for global readability.</p>
    <Field label="Document Type"><select value={form.docType} onChange={e=>setForm({...form,docType:e.target.value})}>{docTypes.map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Original Content"><textarea className="tall" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Paste the document or message here..." /></Field>
    <div className="actions"><button className="primary" disabled={!form.content.trim() || loading} onClick={generate}>Rewrite for Authority</button><button className="secondary" onClick={()=>{setForm({docType:'Email',content:''}); setOutput(''); setError('');}}>Clear</button></div>
    {loading && <div className="loading"><span></span><span></span><span></span> Your coach is thinking...</div>}{error && <p className="error">{error}</p>}{output && <RewriteOutput text={output} />}
  </section></main>;
}

function RewriteOutput({ text }) {
  const parts = parseSections(text);
  if (!Object.keys(parts).length) return <Output label="YOUR REWRITES" text={text} />;
  return <div>{rewriteStyles.map(name => parts[name] ? <Output key={name} label={name} text={parts[name]} /> : null)}</div>;
}

function parseSections(text) {
  const result = {};
  rewriteStyles.forEach((h, i) => {
    const next = rewriteStyles.slice(i + 1).join('|');
    const re = new RegExp(`\\*\\*${h}:?\\*\\*([\\s\\S]*?)(?=${next ? `\\*\\*(?:${next}):?\\*\\*|` : ''}$)`, 'i');
    const m = text.match(re);
    if (m) result[h] = m[1].replace(/\s*---\s*$/, '').replace(/^\s*---\s*/, '').trim();
  });
  return result;
}

function Field({ label, hint, children }) { return <label className="field"><span>{label}{hint && <em>{hint}</em>}</span>{children}</label>; }
function Output({ label, text }) { return <div className="output"><p className="outLabel">{label}</p><div className="outText">{text}</div><button className="secondary" onClick={()=>navigator.clipboard.writeText(text)}>Copy to clipboard</button></div>; }

createRoot(document.getElementById('root')).render(<App />);

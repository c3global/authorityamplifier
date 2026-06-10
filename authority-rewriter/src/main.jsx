import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const languages = ['','Arabic','Bengali','Chinese (Mandarin)','Chinese (Cantonese)','Dutch','French','German','Hindi','Indonesian','Italian','Japanese','Korean','Persian/Farsi','Polish','Portuguese (Brazil)','Portuguese (Portugal)','Russian','Spanish','Swahili','Tagalog','Thai','Turkish','Ukrainian','Urdu','Vietnamese','Other'];
const docTypes = ['Email','Proposal','Presentation notes / slide talking points','Meeting comments / verbal statement','Performance review self-assessment','Executive summary','LinkedIn message or connection note'];
const styles = ['EXECUTIVE','DIPLOMATIC','DIRECT','PERSUASIVE','CULTURALLY INTELLIGENT','COACHING NOTE'];

function App(){
  const [form,setForm]=useState({name:'',industry:'',language:'',docType:'Email',content:''});
  const [output,setOutput]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const valid=form.content.trim();
  async function generate(){
    setLoading(true);setError('');setOutput('');
    const personalization = [form.name && `Your client is ${form.name}`, form.industry && `a professional in ${form.industry}`, form.language && `Their native language is ${form.language}.`].filter(Boolean).join(', ');
    const systemPrompt = `You are an elite executive communication coach and cultural intelligence expert with 20+ years of experience coaching multilingual professionals in global organizations.\n\n${personalization ? personalization : ''}\n\nTask: Rewrite the user's professional communication in five distinct styles. Each version must be substantively different — not just slightly reworded. Each one should feel like it was written by a different strategic communicator with a specific goal in mind.\n\nFormat as:\n\n---\n**EXECUTIVE**\n[Purpose: Commands authority and signals senior-level thinking. Uses precise, confident language. No hedging. Structured for decision-makers who read fast.]\n[Rewritten version]\n\n---\n**DIPLOMATIC**\n[Purpose: Achieves the goal while preserving relationships and saving face. Warm but firm. Uses language that opens doors rather than closing them.]\n[Rewritten version]\n\n---\n**DIRECT**\n[Purpose: Gets to the point immediately. No preamble, no softening. Respects the reader's time. Best for confident internal communication.]\n[Rewritten version]\n\n---\n**PERSUASIVE**\n[Purpose: Moves the reader toward a decision or action. Uses evidence, logic, and subtle urgency. Frames the message around the reader's interests.]\n[Rewritten version]\n\n---\n**CULTURALLY INTELLIGENT**\n[Purpose: Written for a cross-cultural or international audience. Considers face-saving, relationship-first communication norms, avoids idioms or culture-specific references, and adapts assertiveness level for global readability. This is not a generic "professional" rewrite — it is specifically designed for high-context communication environments.]\n[Rewritten version]\n\nAfter all five versions, add:\n\n**COACHING NOTE:**\n[2–3 sentences on which version is recommended for the user's specific situation and why — and one phrase from the original that was the biggest authority leak]`;
    const userPrompt = `Document type: ${form.docType}\n\nOriginal content:\n"${form.content}"\n\nPlease provide all five rewrites.`;
    try{
      const res=await fetch('/.netlify/functions/claude',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({systemPrompt,userPrompt})});
      const data=await res.json(); if(!res.ok) throw new Error(data.error); setOutput(data.text);
    }catch{setError('Connection error. Please try again.');} finally{setLoading(false);}
  }
  return <main className="setup"><section className="setupCard wide"><p className="eyebrow">C3 Global</p><h1>Authority Rewriter™</h1><p className="lead">Paste one professional message. Receive five authority-calibrated rewrites with a culturally intelligent version built for global readability.</p>
    <div className="gridCards two"><Field label="Your Name" hint="Optional"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Your Industry" hint="Optional"><input value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})}/></Field></div>
    <Field label="Native Language" hint="Optional"><select value={form.language} onChange={e=>setForm({...form,language:e.target.value})}>{languages.map(x=><option key={x} value={x}>{x||'Select language'}</option>)}</select></Field>
    <Field label="Document Type"><select value={form.docType} onChange={e=>setForm({...form,docType:e.target.value})}>{docTypes.map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Original Content"><textarea className="tall" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Paste the document or message here..." /></Field>
    <div className="actions"><button className="primary" disabled={!valid||loading} onClick={generate}>Rewrite for Authority</button><button className="secondary" onClick={()=>{setForm({name:'',industry:'',language:'',docType:'Email',content:''});setOutput('');setError('')}}>Clear</button></div>
    {loading&&<div className="loading"><span></span><span></span><span></span> Your coach is thinking...</div>}{error&&<p className="error">{error}</p>}{output&&<RewriteOutput text={output}/>}  
  </section></main>
}
function Field({label,hint,children}){return <label className="field"><span>{label}{hint&&<em>{hint}</em>}</span>{children}</label>}
function RewriteOutput({text}){
  const parts = parseSections(text);
  return <div>{styles.map(name => parts[name] ? <div className="output" key={name}><p className="outLabel">{name}</p><div className="outText">{parts[name]}</div><button className="secondary" onClick={()=>navigator.clipboard.writeText(parts[name])}>Copy this section</button></div> : null)}{!Object.keys(parts).length&&<div className="output"><p className="outLabel">YOUR REWRITES</p><div className="outText">{text}</div><button className="secondary" onClick={()=>navigator.clipboard.writeText(text)}>Copy all</button></div>}</div>
}
function parseSections(text){
  const result={}; const heads=[...styles];
  heads.forEach((h,i)=>{ const next=heads.slice(i+1).join('|'); const re=new RegExp(`\\*\\*${h.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}:?\\*\\*([\\s\\S]*?)(?=${next?`\\*\\*(${next}):?\\*\\*`:'$'}|$)`,'i'); const m=text.match(re); if(m) result[h]=m[1].replace(/^\s*---\s*/,'').trim(); });
  return result;
}
createRoot(document.getElementById('root')).render(<App/>);

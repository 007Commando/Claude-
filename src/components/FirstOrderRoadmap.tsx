"use client";

/**
 * The First Order Roadmap landing page.
 *
 * Built for cold Meta traffic: one offer, one action, and a two-question
 * qualifier that carries the answers into Calendly's utm_term so a booking
 * arrives already labelled with who it came from and what they asked for.
 *
 * Arrived as a TanStack Router route; the route declaration is gone and the
 * component is the default export. The incoming ad's utm_* parameters are
 * passed through to Calendly untouched, so attribution survives the hop.
 */
import { motion, useReducedMotion, useScroll } from "motion/react";
import { BookOpen, Building2, ClipboardCheck, Calculator } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import "./first-order-roadmap.css";
const origin='https://www.apexapplications.io';
/**
 * The roadmap as a route rather than a list.
 *
 * Four rows of text told the reader these were four separate things. The same
 * four on a line that draws itself as they scroll says the thing the page is
 * actually selling: that the steps connect, and that there is an order to
 * them. Same mechanism as /how-it-works, so the two pages teach the same
 * shape — styled in this page's own language rather than the site's.
 */
const stepIcons = [BookOpen, Building2, ClipboardCheck, Calculator];

/** Row height and viewBox width the nodes and the curve are both placed in. */
const STEP_HEIGHT = 300;
const VIEWBOX_WIDTH = 400;

function buildRoadmapPath(count: number) {
  // The node for a left-hand card sits on the *right*, and vice versa: the
  // card opposite it is a row lower, so that side of the row is empty. Placing
  // it on its own card's side drops it on top of the text.
  const points = Array.from({length: count}, (_, i) => ({
    x: i % 2 === 0 ? 260 : 140,
    y: i * STEP_HEIGHT + STEP_HEIGHT / 2,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return {d, points};
}

const steps=[
 ['Find your starting point.','Know what to set up before you buy.','Understand the wholesale model, what suppliers expect, and the questions to answer before committing your inventory budget.','A clearer starting point'],
 ['Find suppliers worth contacting.','Start with 389+ vetted Amazon FBA suppliers.','Build your outreach list, request catalogs, and ask about account requirements, minimum orders, and terms. A supplier list is the start of the conversation.','A supplier outreach plan'],
 ['Check your selling approvals.','Can you actually sell what you want to buy?','Work through the selling-approval roadmap before planning an order. Understand the documentation you may need and check your eligibility for the products you research.','An approval checklist'],
 ['Look beyond the price tag.','Check what is left after the costs.','Use Apex to work through supplier catalogs, review product costs and fees, and organize the products you choose in the Purchase Order Builder.','A more informed purchase order'],
];
const faqs=[['Is this for someone who has never sold on Amazon?','Yes. This roadmap starts with the decisions that come before a first wholesale order. Tell us whether you need help learning the business, finding suppliers, or planning a purchase.'],['What happens on the free strategy call?','We discuss where you are now, what is holding you up, and your next steps. We can also explain the Apex software and coaching options. The call is free; software and coaching may require a paid plan.'],['Do you guarantee supplier accounts or Amazon approvals?','No. Each supplier sets its own account requirements and terms, and Amazon makes selling-approval decisions. The roadmap helps you understand and prepare for the process.'],['Is the book a free download or a physical product?','The book image illustrates the Apex roadmap and digital resources. This page is an invitation to a free strategy call, not an offer for a shipped book, laptop, or free download.'],['Can you help if I am already selling?','Yes. Choose your current stage in the short questionnaire. We can discuss sourcing, purchase planning, and the buying process you use today.']];
export default function FirstOrderRoadmap() {
 const [stage,setStage]=useState('');const [need,setNeed]=useState('');
 const roadmapRef = useRef<HTMLDivElement>(null);
 const reduceMotion = useReducedMotion();
 // The curve fills between these two scroll positions, so it is drawing while
 // the cards are being read rather than finishing before the first one lands.
 const {scrollYProgress} = useScroll({target: roadmapRef, offset: ["start 0.35", "end 0.65"]});
 const {d: pathD, points} = buildRoadmapPath(steps.length);
 const roadmapHeight = steps.length * STEP_HEIGHT;
 const options=stage==='established'?['Wholesale & Brand Direct','Online & Retail Arbitrage','Private Label']:['Learn the business','Find suppliers','Place my first order'];
 function book(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!stage||!need)return;const u=new URL('https://calendly.com/apexapplications-info/new-meeting');const q=new URLSearchParams(window.location.search);for(const key of ['utm_source','utm_medium','utm_campaign','utm_content']){const v=q.get(key);if(v)u.searchParams.set(key,v)}u.searchParams.set('utm_term',`first_order_roadmap:${stage}-${need.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`);window.location.assign(u.toString());}
 return <div className="apex-page">
 <header className="apex-header"><a href={origin} className="brand" aria-label="Apex Applications home"><img src="/assets/bull.png" alt=""/><span>APEX<small>APPLICATIONS</small></span></a><a className="nav-cta" href="#your-plan">Free strategy call <span aria-hidden="true">↗</span></a></header>
 <main>
 <section className="hero">
 <p className="eyebrow">FOR YOUR FIRST AMAZON WHOLESALE ORDER</p>
 <h1>Before your first Amazon order,<br/><mark>get a plan.</mark></h1>
 <p className="hero-sub">Find suppliers. Understand approvals. Check the numbers.<br/>Put the pieces together with Apex software and coaching.</p>
 <a className="hero-cta" href="#your-plan">Help Me Plan My First Order <span aria-hidden="true">→</span><small>Book a free strategy call</small></a>
 <figure className="hero-art"><img src="/assets/roadmap.webp" alt="Apex First Order Roadmap book illustration beside a laptop and shipping boxes" width="1536" height="1024" fetchPriority="high"/><figcaption>Illustration of the digital roadmap. No physical book or equipment included.</figcaption></figure>
 </section>
 <section className="proof-strip" aria-label="The Apex approach"><div><strong>389+</strong><span>Vetted Amazon FBA suppliers</span></div><div><strong>A clear process</strong><span>Supplier search to purchase order</span></div><div><strong>Tools + coaching</strong><span>Learn it. Put it into practice.</span></div></section>
 <section className="letter section"><div className="letter-margin"><span>FROM STEFANO</span><div className="mini-rule"/></div><div className="letter-body"><h2>You want to start.<br/>But what should you buy?</h2><p>You have watched the videos. You know people sell everyday products on Amazon. Now you are looking at a supplier catalog and the real questions begin.</p><div className="questions"><p>“Will this supplier work with me?”</p><p>“Am I allowed to sell this product?”</p><p>“Does this order actually make sense?”</p></div><p>Those are the right questions. They deserve answers <strong>before your money becomes inventory.</strong></p><p>That is what we bring together at Apex: a place to start your supplier search, a roadmap for approvals, software to check your numbers, and coaching to help you use it.</p><p>You do not have to figure out every piece at once. Start with the next decision.</p><div className="signature">Stefano<span>Founder, Apex Applications</span></div></div></section>
 <section className="roadmap-section section"><div className="section-heading"><p className="eyebrow">THE FIRST ORDER ROADMAP</p><h2>Four steps.<br/><span className="blue">One better buying process.</span></h2><p>Here is how the pieces fit together.</p></div>
 <div className="roadmap" ref={roadmapRef} style={{minHeight: roadmapHeight}}>
  <div className="roadmap-rail" aria-hidden="true"><motion.div className="roadmap-rail-fill" style={{scaleY: reduceMotion ? 1 : scrollYProgress}}/></div>
  <svg className="roadmap-track" viewBox={`0 0 ${VIEWBOX_WIDTH} ${roadmapHeight}`} preserveAspectRatio="none" aria-hidden="true">
   <path d={pathD} fill="none" stroke="var(--apex-line)" strokeWidth={3} strokeLinecap="round"/>
   <motion.path d={pathD} fill="none" stroke="var(--apex-blue)" strokeWidth={3} strokeLinecap="round" style={{pathLength: reduceMotion ? 1 : scrollYProgress}}/>
  </svg>
  {steps.map(([title,headline,body,outcome],i)=>{
   const Icon = stepIcons[i];
   const leftCard = i % 2 === 0;
   return (
    <div className="roadmap-row" key={title} style={{minHeight: STEP_HEIGHT}}>
     <span className="roadmap-node" aria-hidden="true" style={{left: `${(points[i].x / VIEWBOX_WIDTH) * 100}%`}}>{i+1}</span>
     <motion.article className={'step-card '+(leftCard?'is-left':'is-right')} initial={{opacity:0, x: leftCard ? -24 : 24}} whileInView={{opacity:1, x:0}} viewport={{once:true, margin:'-80px'}} transition={{duration:0.55, ease:[0.16,1,0.3,1]}}>
      <div className="step-card-head"><span className="step-card-icon"><Icon size={19} strokeWidth={1.9}/></span><span className="step-card-eyebrow">STEP 0{i+1}</span></div>
      <h3>{title}</h3>
      <h4>{headline}</h4>
      <p>{body}</p>
      <span className="step-card-outcome">{outcome}</span>
     </motion.article>
    </div>
   );
  })}
 </div>
 <p className="fineprint">Supplier acceptance, stock, and terms vary. Amazon decides selling approvals. Profit estimates are not guarantees.</p></section>
 <section className="software section"><div className="software-copy"><h2>The plan is only the beginning.</h2><p>Use the tools to do the work.</p><p>Bring supplier catalogs into your process, review costs, and organize your buying decisions with the Apex Purchase Order Builder.</p><a href="#your-plan" className="text-cta">Help Me Plan My First Order <span aria-hidden="true">↗</span></a></div><div className="video-frame"><div className="video-bar"><span>APEX APPLICATIONS</span><span>PRODUCT WALKTHROUGH</span></div><video controls playsInline preload="none" poster="/assets/demo-poster.jpg" src="https://www.apexapplications.io/videos/dashboard-hero-demo.mp4"><a href="https://www.apexapplications.io/videos/dashboard-hero-demo.mp4">Watch the Apex product walkthrough</a></video><p>See the actual Apex software in action.</p></div></section>
 <section className="checklist section"><div className="checklist-title"><h2>Before you click<br/>“place order.”</h2><p>A few questions worth answering first.</p><img src="/assets/bull.png" alt="" loading="lazy"/></div><ul>{['Have I checked the supplier’s account requirements and terms?','Have I checked whether I can sell this product on Amazon?','Have I reviewed product costs, fees, and other order expenses?','Do I know what I am ordering, how much, and why?','Do I understand how the inventory will be prepared and shipped?'].map(t=><li key={t}><span aria-hidden="true">✓</span>{t}</li>)}</ul></section>
 <section className="booking section" id="your-plan"><div className="booking-intro"><p className="eyebrow">YOUR NEXT STEP</p><h2>Let’s talk about<br/><span className="blue">your first order.</span></h2><p>Tell us where you are now. Then choose a time for a free strategy call with our team.</p><p className="booking-note">We will discuss what is holding you up, your next steps, and whether Apex is a fit.</p></div><form onSubmit={book} className="booking-form"><fieldset><legend><span>1</span> Where are you in your Amazon journey?</legend>{[['beginner','I’m getting started','I have not placed my first order.'],['growing','I’m selling under $10k/month','I want a clearer buying process.'],['established','I’m doing $10k+/month','I’m ready to work on my next stage.']].map(([value,label,help])=><label className={'option '+(stage===value?'selected':'')} key={value}><input type="radio" name="stage" value={value} checked={stage===value} onChange={()=>{setStage(value);setNeed('')}} required/><span><strong>{label}</strong><small>{help}</small></span></label>)}</fieldset>{stage&&<fieldset className="second-question"><legend><span>2</span> {stage==='established'?'How do you source products?':'What would help you most right now?'}</legend><div className="needs">{options.map(o=><label className={'need '+(need===o?'selected':'')} key={o}><input type="radio" name="need" required checked={need===o} onChange={()=>setNeed(o)}/><span>{o}</span></label>)}</div></fieldset>}<button className="booking-submit" type="submit" disabled={!stage||!need}>Choose My Call Time <span aria-hidden="true">→</span></button><p className="form-helper">{!stage?'Select your stage to get started.':!need?'Choose an answer above to continue.':'Next: choose an available time on Calendly.'}</p><p className="fineprint">Your call is free. Software and coaching may require a paid plan.</p></form></section>
 <section className="faq section"><h2>A few things<br/>you might be wondering.</h2><div>{faqs.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
 </main><footer className="footer"><a className="brand" href={origin}><img src="/assets/bull.png" alt=""/><span>APEX<small>APPLICATIONS</small></span></a><p>A clearer plan before your first order.</p><div className="footer-bottom"><span>© 2026 Apex Applications</span><div><a href={origin+'/privacy'}>Privacy Policy</a><a href={origin+'/terms'}>Terms of Service</a></div></div><p className="fineprint">This site is not part of or endorsed by Facebook. FACEBOOK is a trademark of Meta Platforms, Inc. Amazon is a trademark of Amazon.com, Inc. or its affiliates.</p></footer>
 </div>
}

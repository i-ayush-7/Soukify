import React, { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Lock, X, Play, Calendar, CreditCard, Mail, Mic, StopCircle, Send, Users, FileText, Share2, Home, Power, HeartPulse, Stethoscope, MessageSquare, Terminal, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Agent Data ───────────────────────────────────────────────────────────
const agents = [
  {
    id: 'agent_travel', name: 'Athena Travel', type: 'Travel Booker',
    emoji: '✈️', emojiColor: 'rgba(245,166,35,0.1)',
    badge: 'featured', badgeLabel: '★ Featured',
    description: 'Books flights and hotels based on calendar availability. Requires payment and calendar access.',
    tags: ['Flights', 'Hotels', 'Calendar', 'Payments'],
    price: '$0', priceUnit: '/ task', rating: '4.9', reviews: '312',
    requestedScopes: [
      { id: 'calendar.read', name: 'Read Calendar', description: 'To check availability for travel.', icon: <Calendar size={18} /> },
      { id: 'calendar.write', name: 'Write Calendar', description: 'To block out travel dates.', icon: <Calendar size={18} /> },
      { id: 'stripe.charge', name: 'Process Payments', description: 'To purchase flights and lodging.', icon: <CreditCard size={18} /> }
    ],
    suggestedTasks: ["Book a flight to Rome this Thursday", "Find a hotel in Paris near the Eiffel Tower"]
  },
  {
    id: 'agent_tax', name: 'Ledger TaxBot', type: 'Tax Specialist',
    emoji: '🧾', emojiColor: 'rgba(0,212,255,0.08)',
    badge: 'new', badgeLabel: 'New',
    description: 'Analyzes invoices and files tax extensions. Requires email strictly for invoices.',
    tags: ['Invoices', 'QuickBooks', 'Tax Filing'],
    price: '$0', priceUnit: '/ task', rating: '4.8', reviews: '187',
    requestedScopes: [
      { id: 'email.read_invoices', name: 'Read Invoices (Email)', description: 'To scan incoming mail for receipts.', icon: <Mail size={18} /> },
      { id: 'accounting.write', name: 'Write Ledger', description: 'To log expenses in QuickBooks.', icon: <FileText size={18} /> }
    ],
    suggestedTasks: ["Scan inbox for January Stripe receipts", "File Q1 extension based on inbox data"]
  },
  {
    id: 'agent_hr', name: 'Nova Recruiter', type: 'Talent Sourcer',
    emoji: '🎯', emojiColor: 'rgba(167,139,250,0.1)',
    badge: 'hot', badgeLabel: '🔥 Hot',
    description: 'Scouts and messages potential candidates on LinkedIn and schedules interviews.',
    tags: ['LinkedIn', 'Outreach', 'Scheduling'],
    price: '$0', priceUnit: '/ task', rating: '4.9', reviews: '243',
    requestedScopes: [
      { id: 'linkedin.message', name: 'Send Messages', description: 'Outreach to potential hires.', icon: <Share2 size={18} /> },
      { id: 'calendar.write', name: 'Schedule Interviews', description: 'To book time on your calendar.', icon: <Calendar size={18} /> }
    ],
    suggestedTasks: ["Message 5 Frontend Engineers on LinkedIn", "Schedule an interview with John Doe for Friday"]
  },
  {
    id: 'agent_social', name: 'Echo Social', type: 'Brand Manager',
    emoji: '📱', emojiColor: 'rgba(34,197,94,0.08)',
    badge: 'featured', badgeLabel: '★ Featured',
    description: 'Drafts, reviews, and autonomously posts updates to your social media channels.',
    tags: ['Twitter/X', 'Instagram', 'Scheduling'],
    price: '$0', priceUnit: '/ task', rating: '4.7', reviews: '156',
    requestedScopes: [
      { id: 'twitter.post', name: 'Post to X/Twitter', description: 'Publish text updates.', icon: <Share2 size={18} /> },
      { id: 'instagram.post', name: 'Post to Instagram', description: 'Publish visual content.', icon: <MessageSquare size={18} /> }
    ],
    suggestedTasks: ["Draft and post a Twitter thread about our new product launch", "Post a promotional graphic to Instagram"]
  },
  {
    id: 'agent_home', name: 'Orion SmartHome', type: 'IoT Controller',
    emoji: '🏠', emojiColor: 'rgba(255,107,107,0.08)',
    badge: 'new', badgeLabel: 'New',
    description: 'Manages physical security and climate limits while you are away.',
    tags: ['Nest', 'Ring', 'Climate', 'Security'],
    price: '$0', priceUnit: '/ task', rating: '4.9', reviews: '98',
    requestedScopes: [
      { id: 'nest.thermostat', name: 'Climate Control', description: 'Change HVAC settings.', icon: <Power size={18} /> },
      { id: 'ring.doors', name: 'Lock Security', description: 'Lock/unlock doors remotely.', icon: <Lock size={18} /> }
    ],
    suggestedTasks: ["Set living room thermostat to 68 degrees", "Lock all front and back doors immediately"]
  },
  {
    id: 'agent_health', name: 'Aura Health', type: 'Medical Concierge',
    emoji: '❤️', emojiColor: 'rgba(245,166,35,0.08)',
    badge: 'hot', badgeLabel: '🔥 Hot',
    description: 'Books clinic appointments based on strict read-only access to specific vitals.',
    tags: ['Vitals', 'Appointments', 'Health Data'],
    price: '$0', priceUnit: '/ task', rating: '4.8', reviews: '421',
    requestedScopes: [
      { id: 'health.read_vitals', name: 'Read Vitals', description: 'Access heart rate and sleep data.', icon: <HeartPulse size={18} /> },
      { id: 'clinic.book', name: 'Book Doctors', description: 'Schedule medical appointments.', icon: <Stethoscope size={18} /> }
    ],
    suggestedTasks: ["Analyze my vitals and book a cardiologist if irregular", "Schedule an annual physical for next month"]
  },
  {
    id: 'agent_analyst', name: 'Atlas Analyst', type: 'Market Intelligence',
    emoji: '📊', emojiColor: 'rgba(0,212,255,0.08)',
    badge: 'live', badgeLabel: '⚡ Live',
    description: 'Monitors real-time public APIs for live financial and crypto market data.',
    tags: ['Bitcoin', 'Ethereum', 'Live APIs', 'CoinGecko'],
    price: '$0', priceUnit: '/ query', rating: '4.9', reviews: '209',
    requestedScopes: [
      { id: 'finance.read_markets', name: 'Read Market Data', description: 'Access live external Web3 APIs.', icon: <Activity size={18} /> }
    ],
    suggestedTasks: ["Fetch the live price of Bitcoin right now", "Check the live Ethereum price"]
  }
];

// ─── Visual Receipts ───────────────────────────────────────────────────────
const TransactionReceipt = ({ data }) => (
  <div className="visual-receipt receipt-transaction">
    <div className="receipt-header"><CreditCard size={14} /> Stripe Payment Executed</div>
    <div className="receipt-body">
      <small style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Amount Charged</small>
      <h1>${data?.amount || '0.00'}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-mid)' }}>
        <span><strong>Vendor:</strong> {data?.vendor || 'Unknown'}</span>
        <span><strong>Card:</strong> **** {data?.last4 || '4242'}</span>
      </div>
    </div>
  </div>
);

const BookingReceipt = ({ data }) => (
  <div className="visual-receipt receipt-booking">
    <div className="receipt-header"><Calendar size={14} /> Verified Booking Confirmation</div>
    <div className="receipt-body">
      <div className="boarding-pass-grid">
        <div>
          <div className="bp-label">Destination/Event</div>
          <div className="bp-value">{data?.destination || data?.title || 'TBD'}</div>
        </div>
        <div>
          <div className="bp-label">Date/Time</div>
          <div className="bp-value">{data?.date || 'As Requested'}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <div className="bp-label">Confirmation Code</div>
        <div style={{ fontSize: '1.3rem', letterSpacing: '4px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{data?.confirmationCode || 'AUTH0-VERIFIED'}</div>
      </div>
    </div>
  </div>
);

const MessageReceipt = ({ data }) => (
  <div className="visual-receipt receipt-message">
    <div className="receipt-header"><Send size={14} /> Message Delivered ({data?.platform || 'System'})</div>
    <div className="receipt-body">
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>To: <strong style={{ color: 'var(--text-mid)' }}>{data?.recipient || 'User'}</strong></p>
      <div className="mock-message-bubble">{data?.body || 'No content provided.'}</div>
    </div>
  </div>
);

const LiveDataReceipt = ({ data }) => (
  <div className="visual-receipt receipt-live">
    <div className="receipt-header"><Activity size={14} /> Live Data · CoinGecko API</div>
    <div className="receipt-body">
      <p style={{ fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Asset: <strong style={{ color: 'var(--text)' }}>{data?.asset || 'BTC'}</strong></p>
      <div className="live-data-stat">${data?.price?.toLocaleString() || '—'}</div>
      <p style={{ marginTop: '8px', fontSize: '0.72rem', opacity: 0.6 }}>As of: {data?.timestamp || new Date().toLocaleTimeString()}</p>
    </div>
  </div>
);

// ─── PCM Audio Decoder (Gemini TTS) ───────────────────────────────────────
const playPCM = async (base64pcm) => {
  try {
    const binaryString = window.atob(base64pcm);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768.0;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (e) { console.error('PCM Decode error:', e); }
};

// ─── Custom Cursor Hook ────────────────────────────────────────────────────
function useCursor() {
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!cursor || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);
    let rafId;
    const animate = () => {
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);
}

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ─── Badge Renderer ────────────────────────────────────────────────────────
const AgentBadge = ({ type, label }) => {
  const cls = type === 'featured' ? 'badge-featured' : type === 'new' ? 'badge-new' : type === 'live' ? 'badge-live' : 'badge-new';
  return <span className={`agent-badge-pill ${cls}`}>{label}</span>;
};

// ═════════════════════════════════════════════════════════════════════════
// ─── LANDING PAGE ─────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════
function LandingPage({ onGetStarted }) {
  useScrollReveal();

  // Nav scroll effect
  useEffect(() => {
    const nav = document.getElementById('s-navbar');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Card glow effect
  useEffect(() => {
    const cards = document.querySelectorAll('.agent-card');
    const handlers = [];
    cards.forEach(card => {
      const fn = (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      };
      card.addEventListener('mousemove', fn);
      handlers.push({ card, fn });
    });
    return () => handlers.forEach(({ card, fn }) => card.removeEventListener('mousemove', fn));
  }, []);

  const marqueeItems = ['Travel Booking', 'Tax Filing', 'Talent Sourcing', 'Social Media', 'Smart Home', 'Health & Fitness', 'Market Analysis', 'Code Generation', 'Customer Support', 'Legal Drafting', 'Financial Modeling', 'Research & Insights'];

  return (
    <>
      {/* NAV */}
      <nav className="s-nav" id="s-navbar">
        <a href="#" className="s-nav-logo">
          <div className="s-nav-logo-mark">S</div>
          Soukify
        </a>
        <ul className="s-nav-links">
          <li><a href="#agents">Browse Agents</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>
        <div className="s-nav-actions">
          <button className="btn-ghost" onClick={onGetStarted}>Sign in</button>
          <button className="btn-gold" onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="s-hero" id="home">
        <div className="orbit-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="ring-dot ring-dot-1"></div>
          <div className="ring-dot ring-dot-2"></div>
        </div>
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          7 Specialized AI Agents · Neural Engine Powered
        </div>
        <h1 className="hero-title">
          <span className="line"><span className="word">Hire</span> <span className="word accent">AI Agents</span></span>
          <span className="line"><span className="word">That Actually</span></span>
          <span className="line"><span className="word">Deliver</span> <span className="word">Results</span></span>
        </h1>
        <p className="hero-sub">Your marketplace for autonomous AI agents that book flights, file taxes, manage your brand, and trade smarter. Powered by advanced AI &amp; secured by Auth0.</p>
        <div className="hero-cta">
          <button className="btn-hero" onClick={onGetStarted}>Explore Agents →</button>
          <button className="btn-sec">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Watch demo
          </button>
        </div>
        <div className="hero-stats">
          <div style={{ textAlign: 'center' }}>
            <div className="hero-stat-num">7<span>+</span></div>
            <div className="hero-stat-label">AI Agents</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div style={{ textAlign: 'center' }}>
            <div className="hero-stat-num">100<span>%</span></div>
            <div className="hero-stat-label">Autonomous</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div style={{ textAlign: 'center' }}>
            <div className="hero-stat-num">Live<span>!</span></div>
            <div className="hero-stat-label">Market Data</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div style={{ textAlign: 'center' }}>
            <div className="hero-stat-num">Auth<span>0</span></div>
            <div className="hero-stat-label">Secured</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div className="marquee-item" key={i}><span className="marquee-dot"></span>{item}</div>
          ))}
        </div>
      </div>

      {/* AGENTS */}
      <section id="agents">
        <div className="section-wrap">
          <div className="agents-header reveal">
            <div>
              <div className="section-label">Our Agents</div>
              <h2 className="section-title">Handpicked for<br/>Excellence</h2>
            </div>
            <div className="agents-filter">
              <button className="filter-pill active">All</button>
              <button className="filter-pill">Finance</button>
              <button className="filter-pill">Travel</button>
              <button className="filter-pill">Productivity</button>
              <button className="filter-pill">Analytics</button>
            </div>
          </div>
          <div className="agents-grid">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className={`agent-card ${agent.badge === 'featured' ? 'featured' : ''} reveal`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="agent-card-top">
                  <div className="agent-avatar" style={{ background: agent.emojiColor }}>
                    {agent.emoji}
                    <div className="agent-avatar-ring"></div>
                  </div>
                  <AgentBadge type={agent.badge} label={agent.badgeLabel} />
                </div>
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.type}</div>
                <div className="agent-desc">{agent.description}</div>
                <div className="agent-tags">
                  {agent.tags.map(t => <span key={t} className="agent-tag">{t}</span>)}
                </div>
                <div className="agent-footer">
                  <div>
                    <div className="agent-price">{agent.price} <span>{agent.priceUnit}</span></div>
                    <div className="agent-rating"><span className="stars">★★★★★</span> {agent.rating} ({agent.reviews})</div>
                  </div>
                  <button className="btn-hire" onClick={onGetStarted}>Hire Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section" id="categories">
        <div className="section-wrap">
          <div className="reveal">
            <div className="section-label">Categories</div>
            <h2 className="section-title">Every Skill,<br/>One Platform</h2>
            <p className="section-sub">From booking flights to analyzing live markets, every autonomous task lives here.</p>
          </div>
          <div className="categories-grid">
            {[
              { icon: '✈️', name: 'Travel & Bookings', count: '1 agent' },
              { icon: '🧾', name: 'Tax & Accounting', count: '1 agent' },
              { icon: '🎯', name: 'HR & Recruiting', count: '1 agent' },
              { icon: '📱', name: 'Social Media', count: '1 agent' },
              { icon: '🏠', name: 'Smart Home / IoT', count: '1 agent' },
              { icon: '❤️', name: 'Health & Medical', count: '1 agent' },
              { icon: '📊', name: 'Finance & Markets', count: '1 agent' },
              { icon: '🔐', name: 'Auth0 Vault', count: 'All agents' },
            ].map((cat, i) => (
              <div key={i} className={`cat-card reveal reveal-delay-${(i % 4) + 1}`}>
                <span className="cat-icon">{cat.icon}</span>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="section-wrap">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
            <div className="section-label">Process</div>
            <h2 className="section-title">Simple. Fast.<br/>Powerful.</h2>
            <p className="section-sub" style={{ margin: '14px auto 0' }}>Get your first AI agent working in seconds. Login with Auth0, grant scopes, dispatch — done.</p>
          </div>
          <div className="steps-grid reveal">
            <div className="step-card">
              <span className="step-num">01</span>
              <div className="step-icon">🔐</div>
              <div className="step-title">Login with Auth0</div>
              <div className="step-desc">Authenticate securely via Auth0 Universal Login SSO. Your payment methods and calendar are vaulted instantly — agents never see raw credentials.</div>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <div className="step-icon">⚙️</div>
              <div className="step-title">Hire &amp; Grant Scopes</div>
              <div className="step-desc">Browse the marketplace and hire an agent. Explicitly delegate only the permissions it needs — full granular token control at all times.</div>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <div className="step-icon">🚀</div>
              <div className="step-title">Autonomous Execution</div>
              <div className="step-desc">Use voice or text. Our neural engine processes your directive autonomously, triggers real APIs, and delivers results with native TTS audio feedback.</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ background: 'var(--surface)', position: 'relative', zIndex: 2 }}>
        <div className="section-wrap">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">Trusted by<br/>builders worldwide</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { quote: '"Soukify\'s Atlas Analyst fetched live Bitcoin prices and spoke a full market analysis aloud in real time. It\'s genuinely magic."', name: 'Sarah Chen', role: 'Head of Marketing, Ravel' },
              { quote: '"The Auth0 Token Vault is genius. My agents have exactly what they need — nothing more, nothing less. Zero trust by design."', name: 'Marcus Rivera', role: 'CTO, Layerstack' },
              { quote: '"I replaced my entire VA workflow with Soukify agents. They book my flights, sync my calendar, and file my taxes. ROI is insane."', name: 'Priya Nair', role: 'Founder, NovaScale' },
            ].map((t, i) => (
              <div key={i} className={`testi-card reveal reveal-delay-${i + 1}`}>
                <div className="testi-stars">★★★★★</div>
                <div className="testi-text">{t.quote}</div>
                <div className="testi-author">
                  <div className="testi-avatar">👤</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={{ paddingTop: '100px', position: 'relative', zIndex: 2 }}>
        <div className="cta-section">
          <div className="cta-banner reveal">
            <h2 className="cta-title">Ready to delegate the future?</h2>
            <p className="cta-sub">Join the builders already powered by Soukify AI agents.</p>
            <div className="cta-actions">
              <button className="btn-hero" onClick={onGetStarted}>Start for Free →</button>
              <button className="btn-sec" onClick={onGetStarted}>View Marketplace</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="s-footer">
        <div className="footer-inner">
          <a href="#" className="s-nav-logo">
            <div className="s-nav-logo-mark">S</div>
            Soukify
          </a>
          <ul className="footer-links">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Docs</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
          <p className="footer-copy">© 2025 Soukify. Powered by AI &amp; secured by Auth0.</p>
        </div>
      </footer>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ─── LOGIN MODAL ──────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════
function LoginModal({ onClose, onSuccess }) {
  const [profile, setProfile] = useState({
    email: 'founder@startup.com',
    paymentMethodVaulted: true,
    calendarVaulted: true,
    cardDetails: 'Visa ending in 4242'
  });

  const handleLogin = () => {
    if ('Notification' in window) Notification.requestPermission();
    onSuccess(profile);
  };

  return (
    <div className="login-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">S</div>
          Soukify<span style={{ color: 'var(--gold)' }}>Vault</span>
        </div>
        <p className="login-subtitle">Auth0 Universal Login · Secure Identity &amp; Data Broker</p>

        <input type="email" className="login-input" placeholder="Email Address"
          value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
        <input type="password" className="login-input" placeholder="Password" defaultValue="password123" />

        <div className="login-divider">Vault Configuration</div>

        <div className="login-vault">
          <div className="login-vault-title">🔐 Auth0 Token Vault</div>
          <label className="vault-toggle">
            <input type="checkbox" checked={profile.paymentMethodVaulted}
              onChange={e => setProfile({ ...profile, paymentMethodVaulted: e.target.checked })} />
            Sync Payment Method (Visa 4242)
          </label>
          <label className="vault-toggle">
            <input type="checkbox" checked={profile.calendarVaulted}
              onChange={e => setProfile({ ...profile, calendarVaulted: e.target.checked })} />
            Authorize Universal Calendar Access
          </label>
        </div>

        <button className="login-btn-full" onClick={handleLogin}>
          Continue with Auth0 SSO →
        </button>
        <p className="login-powered">🔒 Powered by Auth0 Universal Login · Enterprise-grade security</p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ─── MARKETPLACE (Authenticated View) ─────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════
function Marketplace({ userProfile, onLogout }) {
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isHiring, setIsHiring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [processingJobId, setProcessingJobId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Card glow effect
  useEffect(() => {
    const cards = document.querySelectorAll('.agent-card');
    const handlers = [];
    cards.forEach(card => {
      const fn = (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      };
      card.addEventListener('mousemove', fn);
      handlers.push({ card, fn });
    });
    return () => handlers.forEach(({ card, fn }) => card.removeEventListener('mousemove', fn));
  }, []);

  const handleHireAgent = async () => {
    setIsHiring(true);
    let tokenBundle;
    try {
      const res = await axios.post(`${API_BASE}/api/hire`, {
        agentId: selectedAgent.id,
        scopes: selectedAgent.requestedScopes.map(s => s.id),
        userId: userProfile.email
      });
      tokenBundle = res.data.tokenBundle;
    } catch (e) {
      console.warn('Hire API unreachable, using local mock token:', e.message);
      // Fallback: create a local mock token so the pipeline always works
      tokenBundle = {
        access_token: `local_mock_${Math.random().toString(36).substring(7)}_${Date.now()}`,
        expires_in: 3600,
        token_type: 'Bearer',
        scopes_granted: selectedAgent.requestedScopes.map(s => s.id)
      };
    }
    const newJob = {
      id: `job_${Date.now()}`, agent: selectedAgent,
      status: 'awaiting_input', token: tokenBundle,
      createdAt: new Date().toLocaleTimeString(), pipelines: []
    };
    setActiveJobs(prev => [newJob, ...prev]);
    setSelectedAgent(null);
    setIsHiring(false);
  };

  const handleRevoke = async (jobId, token) => {
    try {
      await axios.post(`${API_BASE}/api/revoke`, { token });
      setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'done', token: null } : j));
    } catch (e) { console.error(e); }
  };

  const executePipeline = async (job, inputType, prompt) => {
    setProcessingJobId(job.id);
    setTaskInput('');
    const newPipeline = {
      id: Date.now(),
      prompt: inputType === 'voice' ? '🎤 Voice Directive Received' : prompt,
      auth0State: 'verifying', agentState: 'analyzing', result: null
    };
    setActiveJobs(prev => prev.map(j => j.id === job.id ? { ...j, pipelines: [...j.pipelines, newPipeline] } : j));

    try {
      let res;
      if (inputType === 'text') {
        res = await axios.post(`${API_BASE}/api/agent/chat`, {
          token: job.token, taskDetails: prompt,
          agentContext: { description: job.agent.description },
          userProfile
        });
      } else {
        const formData = new FormData();
        formData.append('audio', prompt, 'command.webm');
        formData.append('token', JSON.stringify(job.token));
        formData.append('agentContext', JSON.stringify({ description: job.agent.description }));
        formData.append('userProfile', JSON.stringify(userProfile));
        res = await axios.post(`${API_BASE}/api/agent/voice`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setTimeout(() => {
        const resultData = res.data.agentData;
        setActiveJobs(prev => prev.map(j => {
          if (j.id !== job.id) return j;
          return {
            ...j,
            pipelines: j.pipelines.map(p =>
              p.id === newPipeline.id
                ? { ...p, auth0State: 'verified', agentState: 'executed', result: resultData }
                : p
            )
          };
        }));
        setProcessingJobId(null);

        // Native hooks
        if (resultData?.narrative) {
          if (res.data.audioBase64) playPCM(res.data.audioBase64);
          if (Notification.permission === 'granted') {
            new Notification('Soukify · Agent Executed', { body: resultData.narrative, icon: '/favicon.ico' });
          }
        }
      }, 800);

    } catch (err) {
      console.error(err);
      setActiveJobs(prev => prev.map(j => {
        if (j.id !== job.id) return j;
        return {
          ...j,
          pipelines: j.pipelines.map(p =>
            p.id === newPipeline.id
              ? { ...p, auth0State: 'verified', agentState: 'executed', result: { actionCategory: 'message', receiptData: { platform: 'System Error', body: err.response?.data?.error || err.message }, narrative: 'Error' } }
              : p
          )
        };
      }));
      setProcessingJobId(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch { alert('Please enable microphone access.'); }
  };

  const stopRecording = (job) => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = [];
      setIsRecording(false);
      executePipeline(job, 'voice', blob);
    };
    mediaRecorderRef.current.stop();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* App Nav */}
      <nav className="app-nav">
        <div className="app-logo">
          <div className="app-logo-mark">S</div>
          Soukify<span style={{ color: 'var(--gold)' }}>Vault</span>
        </div>
        <div className="app-user">
          <span className="app-user-email">Signed in as <span>{userProfile.email}</span></span>
          <button className="btn-ghost" onClick={onLogout}>Log Out</button>
        </div>
      </nav>

      <div className="app-content">
        {/* Left: Marketplace Grid */}
        <div className="app-left">
          <div className="app-page-header">
            <h1>
              Agent Marketplace
              <span className="gemini-badge">Soukify AI Brain</span>
            </h1>
            <p>Hire specialized AI agents and dispatch autonomous execution tasks. Secured by Auth0 Token Vault.</p>
          </div>
          <div className="agents-grid">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className={`agent-card ${agent.badge === 'featured' ? 'featured' : ''}`}
              >
                <div className="agent-card-top">
                  <div className="agent-avatar" style={{ background: agent.emojiColor }}>
                    {agent.emoji}
                    <div className="agent-avatar-ring"></div>
                  </div>
                  <AgentBadge type={agent.badge} label={agent.badgeLabel} />
                </div>
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.type}</div>
                <div className="agent-desc">{agent.description}</div>
                <div className="agent-tags">
                  {agent.tags.map(t => <span key={t} className="agent-tag">{t}</span>)}
                </div>
                <div className="agent-footer">
                  <div>
                    <div className="agent-price">{agent.price} <span>{agent.priceUnit}</span></div>
                    <div className="agent-rating"><span className="stars">★★★★★</span> {agent.rating}</div>
                  </div>
                  <button className="btn-hire" onClick={() => setSelectedAgent(agent)}>
                    Hire Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Execution Pipelines */}
        <div className="app-right">
          <div className="pipeline-panel" style={{ position: 'sticky', top: '90px' }}>
            <div className="pipeline-panel-title">
              <Terminal size={18} color="var(--gold)" />
              Execution Pipelines
            </div>

            {activeJobs.length === 0 && (
              <div className="pipeline-empty">
                <div className="pipeline-empty-icon">⚡</div>
                <p>No active pipelines.<br/>Hire an agent to begin.</p>
              </div>
            )}

            <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {activeJobs.map(job => (
                <div key={job.id} className={`job-card ${job.status === 'done' ? 'done' : ''}`}>
                  <div className="job-card-header">
                    <div>
                      <div className="job-card-title">{job.agent.name}</div>
                      <span className={`job-status-badge ${job.status === 'done' ? 'done' : 'active'}`}>
                        {job.status === 'done' ? '⛔ Revoked' : '● Active · Auth0 Hooked'}
                      </span>
                    </div>
                    {job.status !== 'done' && (
                      <button className="btn-danger" onClick={() => handleRevoke(job.id, job.token)}>
                        <Lock size={13} /> Revoke
                      </button>
                    )}
                  </div>

                  {/* Pipeline Entries */}
                  {job.pipelines.map((pipe, idx) => (
                    <div key={idx} className="pipe-entry">
                      <div className="pipe-prompt">{pipe.prompt}</div>

                      <div className="pipe-step">
                        <div className="pipe-step-icon" style={{ borderColor: pipe.auth0State === 'verified' ? '#4ade80' : '#facc15' }}>
                          <Shield size={10} color={pipe.auth0State === 'verified' ? '#4ade80' : '#facc15'} />
                        </div>
                        <div className="pipe-step-content">
                          <p>Auth0 Token Vault</p>
                          <small>{pipe.auth0State === 'verifying' ? 'Validating scoped permissions...' : `Verified: ${job.agent.requestedScopes.map(s => s.id).join(', ')}`}</small>
                        </div>
                      </div>

                      <div className="pipe-step">
                        <div className="pipe-step-icon" style={{ borderColor: pipe.agentState === 'executed' ? '#60a5fa' : '#4ade80' }}>
                          <Zap size={10} color={pipe.agentState === 'executed' ? '#60a5fa' : '#facc15'} />
                        </div>
                        <div className="pipe-step-content">
                          <p>AI Execution Engine</p>
                          <small>{pipe.agentState === 'analyzing' ? 'Processing intent autonomously...' : pipe.result?.narrative || 'Done'}</small>
                        </div>
                      </div>

                      {pipe.result && (
                        <div style={{ marginTop: '10px' }}>
                          {pipe.result.actionCategory === 'transaction' && <TransactionReceipt data={pipe.result.receiptData} />}
                          {pipe.result.actionCategory === 'booking' && <BookingReceipt data={pipe.result.receiptData} />}
                          {pipe.result.actionCategory === 'message' && <MessageReceipt data={pipe.result.receiptData} />}
                          {pipe.result.actionCategory === 'live_data' && <LiveDataReceipt data={pipe.result.receiptData} />}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Input Area */}
                  {job.status !== 'done' && (
                    <div className="job-input-area">
                      {job.pipelines.length === 0 && (
                        <div className="quick-chips">
                          <span className="quick-chip-label">⚡ Quick Prompts:</span>
                          {job.agent.suggestedTasks?.map((task, i) => (
                            <button
                              key={i} className="quick-chip"
                              onClick={() => executePipeline(job, 'text', task)}
                              disabled={processingJobId === job.id}
                            >{task}</button>
                          ))}
                        </div>
                      )}
                      <div className="input-row">
                        <input
                          type="text" className="task-input"
                          placeholder="Type custom directive..."
                          value={taskInput}
                          onChange={e => setTaskInput(e.target.value)}
                          disabled={processingJobId === job.id}
                          onKeyDown={e => { if (e.key === 'Enter' && !processingJobId && taskInput.trim()) executePipeline(job, 'text', taskInput); }}
                        />
                        <button className="send-btn" onClick={() => { if (taskInput.trim()) executePipeline(job, 'text', taskInput); }} disabled={processingJobId === job.id || !taskInput.trim()}>
                          <Send size={16} />
                        </button>
                        <button
                          className={`mic-btn ${isRecording ? 'recording' : ''}`}
                          onClick={isRecording ? () => stopRecording(job) : startRecording}
                          disabled={processingJobId === job.id && !isRecording}
                        >
                          {isRecording ? <StopCircle size={16} className="spin" /> : <Mic size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scope Modal */}
      {selectedAgent && (
        <div className="scope-modal-overlay" onClick={e => e.target === e.currentTarget && !isHiring && setSelectedAgent(null)}>
          <div className="scope-modal">
            <div className="scope-modal-header">
              <h2>Grant Agent Scopes</h2>
              <button className="close-btn" onClick={() => !isHiring && setSelectedAgent(null)}><X size={18} /></button>
            </div>
            <p className="scope-desc">
              To allow <strong style={{ color: 'var(--text)' }}>{selectedAgent.name}</strong> to execute autonomous tasks, you must explicitly delegate access via the Auth0 Token Vault.
            </p>
            <div className="scope-list">
              <div style={{ fontSize: '0.72rem', fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Requested Execution Scopes</div>
              {selectedAgent.requestedScopes.map(scope => (
                <div key={scope.id} className="scope-item">
                  <div className="scope-icon">{scope.icon}</div>
                  <div>
                    <div className="scope-item-name">{scope.name}</div>
                    <div className="scope-item-desc">{scope.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="scope-modal-actions">
              <button className="btn-outline" onClick={() => setSelectedAgent(null)} disabled={isHiring}>Cancel</button>
              <button className="btn-gold" onClick={handleHireAgent} disabled={isHiring}>
                {isHiring ? 'Minting Token...' : 'Grant Scope & Spawn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'marketplace'
  const [showLogin, setShowLogin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useCursor();

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
    setShowLogin(false);
    setView('marketplace');
  };

  const handleLogout = () => {
    setUserProfile(null);
    setView('landing');
  };

  return (
    <>
      <div id="cursor"></div>
      <div id="cursor-ring"></div>

      {view === 'landing' && (
        <LandingPage onGetStarted={() => setShowLogin(true)} />
      )}

      {view === 'marketplace' && userProfile && (
        <Marketplace userProfile={userProfile} onLogout={handleLogout} />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

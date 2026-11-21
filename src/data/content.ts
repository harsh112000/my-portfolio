// ─────────────────────────────────────────────────────────────
//  Single source of truth for everything on the site.
//  Set GITHUB_USERNAME to your handle and the GitHub section
//  pulls your profile, repos, stars and languages live.
// ─────────────────────────────────────────────────────────────

export const GITHUB_USERNAME = 'harsh112000';

// Repos shown first in the GitHub section, in this order. Anything missing or renamed is skipped,
// and remaining slots fill with your most recently pushed repos that have a description.
export const FEATURED_REPOS = [
  'mcp-sql-agent',
  'ConvoBot',
  'cloud-host',
  'rate-limit-package',
  'UserManagment-APP',
  'VibeConnect',
];

// Descriptions used when a repo has none on GitHub.
export const REPO_NOTES: Record<string, string> = {
  'rate-limit-package': 'Rate-limiting middleware for Node.js and Express APIs, packaged for reuse.',
  'train-ticket-booking': 'Train ticket booking backend.',
};

export const profile = {
  name: 'Harsh Srivastava',
  first: 'Harsh',
  role: 'Senior Software Engineer',
  location: 'Gurugram, India',
  email: 'harshvns1105@gmail.com',
  available: true,
  availabilityText: 'Open to senior backend & platform roles',
  socials: {
    linkedin: 'https://www.linkedin.com/in/harshrivastava',
    leetcode: 'https://leetcode.com/u/harsh1105',
    github: GITHUB_USERNAME ? `https://github.com/${GITHUB_USERNAME}` : '',
  },
};

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'systems', label: 'Systems' },
  { id: 'skills', label: 'Stack' },
  ...(GITHUB_USERNAME ? [{ id: 'github', label: 'GitHub' }] : []),
  { id: 'contact', label: 'Contact' },
];

export const stats = [
  { value: 4, suffix: '+', label: 'Years shipping production systems' },
  { value: 30, suffix: '%', label: 'Faster API responses after the microservices migration' },
  { value: 2, suffix: '', label: 'Payment platforms built end to end, fiat and crypto' },
  { value: 100, suffix: '%', label: 'Of payment flows designed to be idempotent' },
];

export type Experience = {
  company: string;
  org?: string;
  role: string;
  period: string;
  start: string;
  blurb: string;
  url?: string;
  highlights: { text: string; context: string }[];
  metrics: { value: number; suffix: string; label: string }[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    company: 'Zoop',
    org: 'Ixigo Group',
    role: 'Senior Software Engineer',
    period: 'Jan 2024 — Present',
    start: '2024',
    blurb: 'Onboard food delivery for Indian Railways: orders placed in transit, delivered to your seat at the next station.',
    highlights: [
      {
        text: 'Moved the admin panel and core APIs from a monolith to microservices on Node.js, Express, TypeScript and Sequelize.',
        context: 'Broke apart by domain (orders, payments, vendors, comms) so each service scales and deploys on its own. API latency dropped 30%.',
      },
      {
        text: 'Ran payment, settlement and customer communication (email, WhatsApp) through Kafka.',
        context: 'Producers emit domain events; consumers handle settlement and notifications asynchronously, so slow third parties never block checkout.',
      },
      {
        text: 'Designed idempotent payment and order workflows that survive retries, partial failures and duplicate events.',
        context: 'Idempotency keys plus state-machine transitions guarded at the database layer, so a duplicate webhook or a consumer replay never double-charges.',
      },
      {
        text: 'Built ledger-based settlement and wallet systems for COD and prepaid orders.',
        context: 'Double-entry ledger rows are append-only. Balances are derived, never mutated in place, which keeps reconciliation and audits simple.',
      },
    ],
    metrics: [
      { value: 30, suffix: '%', label: 'API latency cut' },
      { value: 3, suffix: '', label: 'Event-driven workflows' },
    ],
    stack: ['Node.js', 'TypeScript', 'Express', 'Sequelize', 'Kafka', 'MySQL', 'Redis', 'AWS'],
  },
  {
    company: 'BloqueLabs',
    role: 'Full Stack Developer',
    period: 'Jan 2022 — Dec 2023',
    start: '2022',
    blurb: 'A crypto payment gateway and Web3 transaction platform.',
    highlights: [
      {
        text: 'Built a crypto payment gateway with wallet-based authorization, on-chain confirmation tracking and secure settlement.',
        context: 'Watchers poll chain confirmations and advance each payment only once it reaches a safe block depth, which guards against re-orgs.',
      },
      {
        text: 'Owned the full transaction lifecycle (initiated, pending, confirmed, failed) with retries and reconciliation.',
        context: 'An explicit state machine with timeouts; stuck transactions go to a reconciliation job instead of failing silently.',
      },
      {
        text: 'Built a decentralized social platform on blockchain for secure, transparent interactions.',
        context: 'Content hashes live on-chain for verifiability; heavy media stays off-chain for cost and speed.',
      },
      {
        text: 'Shipped wallet-integrated mobile payment flows with React Native, Expo and MetaMask.',
        context: 'Deep-link handoff to MetaMask for signing, with optimistic UI while confirmations come in.',
      },
    ],
    metrics: [
      { value: 4, suffix: '', label: 'Lifecycle states' },
      { value: 2, suffix: '', label: 'Platforms shipped' },
    ],
    stack: ['React Native', 'Expo', 'MetaMask', 'Node.js', 'MongoDB', 'React', 'Web3'],
  },
];

export type Project = {
  id: string;
  title: string;
  tagline: string;
  year: string;
  accent: string;
  problem: string;
  approach: string;
  decisions: string[];
  stack: string[];
  flow: string[];
  outcome: string;
};

export const projects: Project[] = [
  {
    id: 'payments',
    title: 'Payment Gateway & Transaction Engine',
    tagline: 'Payment initiation, status tracking and settlement, built so a retry can never charge twice.',
    year: '2025',
    accent: '#5eead4',
    problem:
      'Payment providers retry webhooks, networks drop mid-request and users double-tap "Pay". Without care, any of these becomes a double charge or a lost settlement.',
    approach:
      'Every payment is a state machine keyed by an idempotency token. APIs accept a request once, persist intent before calling a provider, and reconcile asynchronously. Monitoring tracks every transition and alerts on unhealthy flows.',
    decisions: [
      'Idempotency keys stored with a unique constraint, so duplicates fail fast at the DB',
      'Persist intent before any external call, then reconcile on the callback',
      'Append-only audit log for every state transition',
      'Real-time health metrics with alerts on stuck or failing transactions',
    ],
    stack: ['Node.js', 'TypeScript', 'MySQL', 'Redis', 'Kafka', 'AWS'],
    flow: ['Client', 'API Gateway', 'Payment Service', 'Redis', 'MySQL', 'Provider'],
    outcome: 'Payments stay correct under retries, partial failures and duplicate events.',
  },
  {
    id: 'settlement',
    title: 'Event-Driven Settlement Ledger',
    tagline: 'Double-entry wallets and settlements for COD and prepaid orders, driven by Kafka.',
    year: '2024',
    accent: '#7dd3fc',
    problem:
      'Vendor payouts mixed cash-on-delivery and prepaid orders. Mutable balances drifted, and reconciling them took manual spreadsheet work.',
    approach:
      'Order and payment events stream through Kafka into a settlement consumer that writes balanced ledger entries. Wallet balances are projections of the ledger, so the books always reconcile.',
    decisions: [
      'Append-only, double-entry ledger as the source of truth',
      'Consumers are idempotent by event ID, so replays are safe',
      'Balances derived from entries, never updated in place',
      'Communication (email, WhatsApp) decoupled as separate consumers',
    ],
    stack: ['Kafka', 'Node.js', 'Sequelize', 'MySQL', 'AWS SES'],
    flow: ['Order Service', 'Kafka', 'Settlement', 'Ledger', 'MySQL', 'Notify'],
    outcome: 'The books are audit-ready, and reconciliation no longer needs manual work.',
  },
  {
    id: 'loans',
    title: 'Loan Disbursement Platform',
    tagline: 'Partner onboarding, KYC and reliable loan disbursement for a fintech lender.',
    year: '2024',
    accent: '#a78bfa',
    problem:
      'Approved loans had to reach borrowers reliably, and every lending partner needed onboarding with KYC, bank verification and its own lender configuration.',
    approach:
      'Modular onboarding services for KYC and bank verification feed a disbursement workflow integrated with a payment gateway. Disbursements and repayments carry explicit lifecycle states.',
    decisions: [
      'KYC and bank verification isolated as independent modules',
      'Lifecycle states for disbursement and repayment, so every transition is traceable',
      'Compliance requirements translated directly into service boundaries',
      'Gateway callbacks reconciled against internal state',
    ],
    stack: ['Node.js', 'PostgreSQL', 'REST', 'Payment Gateway', 'AWS'],
    flow: ['Partner', 'Onboarding API', 'KYC Service', 'Disbursal', 'PostgreSQL', 'Gateway'],
    outcome: 'Lending operations are audit-ready, with a clear trail for every rupee.',
  },
  {
    id: 'web3',
    title: 'Crypto Payment Gateway',
    tagline: 'Wallet-authorized crypto payments with on-chain confirmation tracking and payouts.',
    year: '2023',
    accent: '#fbbf77',
    problem:
      'On-chain payments are asynchronous and probabilistic. A transaction that "succeeded" can still be re-orged out, so treating broadcast as final is unsafe.',
    approach:
      'Wallet signatures authorize payments; a confirmation tracker advances each transaction only after enough block depth. Failures and timeouts go to retry and reconciliation.',
    decisions: [
      'Explicit lifecycle: initiated, pending, confirmed, failed',
      'Confirmation depth thresholds before settlement',
      'MetaMask deep-linking for mobile signing in React Native',
      'Reconciliation jobs for stuck or dropped transactions',
    ],
    stack: ['React Native', 'Expo', 'MetaMask', 'Node.js', 'MongoDB'],
    flow: ['Wallet', 'dApp API', 'Tx Service', 'Chain Watcher', 'MongoDB', 'Blockchain'],
    outcome: 'Crypto payouts settle reliably, whatever the chain does.',
  },
];

export type SkillNode = { id: string; label: string; group: string; x: number; y: number; links: string[] };

export const skillGroups: Record<string, { label: string; color: string; note: string }> = {
  runtime: { label: 'Runtime & APIs', color: '#5eead4', note: 'Where requests become behaviour.' },
  data: { label: 'Data & Storage', color: '#7dd3fc', note: 'Durable state, modelled carefully.' },
  events: { label: 'Events & Caching', color: '#a78bfa', note: 'Decoupling in time and load.' },
  cloud: { label: 'Cloud', color: '#fbbf77', note: 'Managed infrastructure on AWS and Azure.' },
  client: { label: 'Client', color: '#f0abfc', note: 'The surfaces people actually touch.' },
};

// Coordinates are in a 1000 x 560 viewBox.
export const skills: SkillNode[] = [
  { id: 'node', label: 'Node.js', group: 'runtime', x: 470, y: 270, links: ['express', 'ts', 'kafka', 'redis', 'mysql', 'graphql'] },
  { id: 'express', label: 'Express', group: 'runtime', x: 330, y: 190, links: ['rest', 'orm'] },
  { id: 'ts', label: 'TypeScript', group: 'runtime', x: 400, y: 120, links: ['react', 'next'] },
  { id: 'rest', label: 'REST', group: 'runtime', x: 210, y: 230, links: ['react'] },
  { id: 'graphql', label: 'GraphQL', group: 'runtime', x: 300, y: 330, links: ['react'] },
  { id: 'micro', label: 'Microservices', group: 'runtime', x: 560, y: 150, links: ['node', 'kafka', 'ec2'] },
  { id: 'orm', label: 'Sequelize / ORM', group: 'data', x: 430, y: 410, links: ['mysql', 'postgres'] },
  { id: 'mysql', label: 'MySQL', group: 'data', x: 580, y: 420, links: ['rds'] },
  { id: 'postgres', label: 'PostgreSQL', group: 'data', x: 330, y: 470, links: ['rds'] },
  { id: 'mongo', label: 'MongoDB', group: 'data', x: 190, y: 400, links: ['node'] },
  { id: 'firebase', label: 'Firebase', group: 'data', x: 110, y: 310, links: ['react'] },
  { id: 'kafka', label: 'Kafka', group: 'events', x: 680, y: 260, links: ['ses', 'lambda'] },
  { id: 'redis', label: 'Redis', group: 'events', x: 640, y: 340, links: ['mysql'] },
  { id: 'workflow', label: 'Workflow Automation', group: 'events', x: 790, y: 180, links: ['kafka', 'lambda'] },
  { id: 'ec2', label: 'AWS EC2', group: 'cloud', x: 760, y: 90, links: [] },
  { id: 'lambda', label: 'AWS Lambda', group: 'cloud', x: 860, y: 280, links: [] },
  { id: 's3', label: 'AWS S3', group: 'cloud', x: 880, y: 390, links: ['lambda'] },
  { id: 'ses', label: 'AWS SES', group: 'cloud', x: 790, y: 440, links: [] },
  { id: 'rds', label: 'AWS RDS', group: 'cloud', x: 700, y: 490, links: [] },
  { id: 'azure', label: 'Azure', group: 'cloud', x: 900, y: 160, links: [] },
  { id: 'react', label: 'React', group: 'client', x: 230, y: 110, links: ['next', 'rn'] },
  { id: 'next', label: 'Next.js', group: 'client', x: 110, y: 170, links: [] },
  { id: 'rn', label: 'React Native', group: 'client', x: 90, y: 60, links: [] },
  { id: 'scss', label: 'SCSS', group: 'client', x: 290, y: 40, links: ['react'] },
];

export const terminalScript: { cmd: string; out: string[] }[] = [
  { cmd: 'whoami', out: ['Harsh Srivastava'] },
  { cmd: 'specialization', out: ['Backend Engineering', 'Distributed Systems', 'Scalable Architecture'] },
  { cmd: 'cat now.txt', out: ['Senior SWE @ Zoop (Ixigo Group)', 'Kafka · idempotency · ledgers'] },
  { cmd: 'status', out: ['Building systems that scale…'] },
];

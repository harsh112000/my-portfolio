// Fallback used when the live GitHub API can't be reached (offline, rate-limited, or a sandbox
// that blocks third-party requests). Captured from github.com/harsh112000 in November 2026.
import type { GhData, Repo } from '../hooks/useGithub';

const r = (name: string, description: string | null, language: string | null, pushed: string, stars = 0): Repo => ({
  name, description, language, html_url: `https://github.com/harsh112000/${name}`, homepage: null,
  stargazers_count: stars, forks_count: 0, fork: false, pushed_at: `${pushed}T00:00:00Z`, size: 1, archived: false,
});

const repos: Repo[] = [
  r('mcp-sql-agent', 'Prompt-driven SQL agent built on the Model Context Protocol.', 'JavaScript', '2025-07-08'),
  r('ConvoBot', 'Chrome extension that moves ChatGPT conversations to other AI platforms when you hit message limits.', 'JavaScript', '2025-06-26'),
  r('train-ticket-booking', null, 'JavaScript', '2025-05-26'),
  r('stripte', null, 'JavaScript', '2025-04-12'),
  r('purity-licence', null, 'JavaScript', '2025-04-01'),
  r('rating-review', null, 'JavaScript', '2025-03-07'),
  r('ActForGood', 'NGO website.', null, '2024-11-23'),
  r('food-licence', null, 'JavaScript', '2024-11-10'),
  r('certify', null, null, '2024-11-10'),
  r('PromptHead', 'Next.js app for generating AI prompts.', 'CSS', '2024-07-03'),
  r('FileFusion', 'React cloud storage app built on third-party APIs.', 'JavaScript', '2024-06-29'),
  r('A-React-Learner-Guide', 'React examples: accordion, star rating, dropdown, carousel.', 'JavaScript', '2024-05-17'),
  r('cloud-host', 'Vercel-like cloud hosting platform.', 'JavaScript', '2024-05-03'),
  r('rate-limit-package', null, 'JavaScript', '2024-04-20', 1),
  r('Api-Rate-Limit-Node.js-', 'Alternative to express-rate-limit.', 'JavaScript', '2024-04-19'),
  r('Get-Client-Ip-Address', 'Several ways to get the client IP in Node and Express.', 'JavaScript', '2024-04-13'),
  r('UserManagment-APP', 'User management app with Next.js, Express, PostgreSQL, Prisma and Docker.', 'TypeScript', '2024-04-07'),
  r('node-express-typescript-boilerplate', 'Node, Express and TypeScript boilerplate.', null, '2024-03-22'),
  r('viber', 'React video chat app.', 'JavaScript', '2024-03-09'),
  r('VibeConnect', 'Video calls with React, Socket.IO and WebRTC.', 'JavaScript', '2024-03-05'),
  r('blog-editor-backend', 'Backend for blog-editor: admin, users, JWT auth.', 'JavaScript', '2023-07-19'),
  r('blog-editor-front-end', 'React front end for blog-editor.', 'SCSS', '2023-07-17'),
  r('travel-planner', 'MERN travel planner.', null, '2023-05-31'),
  r('Quizzinga', 'React quiz web app.', 'JavaScript', '2023-04-26'),
  r('chatup-client', 'Client for chatup-server.', 'JavaScript', '2023-04-16'),
  r('chatup-server', null, null, '2023-04-13'),
  r('blog-editor', null, 'HTML', '2023-02-12'),
  r('github-slideshow', 'A robot powered training repository.', 'Ruby', '2020-08-21'),
];

export const githubSnapshot: Omit<GhData, 'top' | 'languages' | 'stars' | 'forks' | 'years'> & { createdAt: string } = {
  user: { login: 'harsh112000', name: null, avatar_url: '', html_url: 'https://github.com/harsh112000', public_repos: 28, followers: 1, bio: null, created_at: '2020-08-01T00:00:00Z' },
  repos,
  createdAt: '2020-08-01T00:00:00Z',
};

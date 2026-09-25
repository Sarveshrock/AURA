import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';
import { voiceRouter } from './routes/voice.js';
import { decisionsRouter } from './routes/decisions.js';
import { shoppingRouter } from './routes/shopping.js';
import { travelRouter } from './routes/travel.js';
import { researchRouter } from './routes/research.js';
import { calendarRouter } from './routes/calendar.js';
import { createResourceRouter } from './routes/resource.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(pinoHttp({ redact: ['req.headers.authorization'] }));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/', (_req, res) => res.json({ service: 'aura-node-backend', status: 'running' }));
app.use('/health', healthRouter);
app.use('/chat', chatRouter);
app.use('/voice', voiceRouter);
app.use('/decisions', decisionsRouter);
app.use('/shopping', shoppingRouter);
app.use('/travel', travelRouter);
app.use('/research', researchRouter);
app.use('/calendar', calendarRouter);

// Domain resources backed directly by Supabase tables (RLS-enforced).
// Bespoke business logic can replace any of these incrementally.
const resourceDomains = [
  'tasks',
  'finance',
  'wellness',
  'memory',
  'automations',
  'integrations',
  'notifications',
  'approvals',
  'agents',
] as const;

for (const domain of resourceDomains) {
  app.use(`/${domain}`, createResourceRouter(domain === 'memory' ? 'memory_items' : domain));
}

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: env.corsOrigins, credentials: true },
});

// Real-time agent activity channel. Agents/AI service publish events here
// via an internal endpoint or message bus in a fuller implementation.
io.on('connection', (socket) => {
  socket.emit('aura:connected', { time: new Date().toISOString() });
});

httpServer.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`AURA backend listening on port ${env.port} (${env.nodeEnv})`);
});

export { io };

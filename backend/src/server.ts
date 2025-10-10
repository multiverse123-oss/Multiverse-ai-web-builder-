import fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const server = fastify({ logger: true });
const prisma = new PrismaClient();

// Register plugins
server.register(cors, {
  origin: '*', // Allow all origins for simplicity, should be restricted in production
});
server.register(websocket);

// WebSocket route
server.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      // Handle WebSocket messages
      console.log(`Received message: ${message}`);
      connection.socket.send('Hello from server');
    });
  });
});

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';

// Register routes
server.register(authRoutes, { prefix: '/auth' });
server.register(projectRoutes, { prefix: '/api' });

// Health check route
server.get('/', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
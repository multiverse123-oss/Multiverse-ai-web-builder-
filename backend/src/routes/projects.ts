import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function (fastify: FastifyInstance) {
  fastify.get('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    const projects = await prisma.project.findMany();
    reply.send(projects);
  });

  fastify.post('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, userId } = request.body as any;
    const project = await prisma.project.create({
      data: {
        name,
        userId,
      },
    });
    reply.send(project);
  });

  fastify.get('/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const project = await prisma.project.findUnique({ where: { id } });
    reply.send(project);
  });

  fastify.put('/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const { name } = request.body as any;
    const project = await prisma.project.update({
      where: { id },
      data: { name },
    });
    reply.send(project);
  });

  fastify.delete('/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    await prisma.project.delete({ where: { id } });
    reply.send({ message: 'Project deleted' });
  });
}
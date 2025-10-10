import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function (fastify: FastifyInstance) {
  fastify.post('/signup', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, name } = request.body as any;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });
      reply.send(user);
    } catch (error) {
      reply.status(400).send({ error: 'User already exists' });
    }
  });

  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as any;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(400).send({ error: 'Invalid email or password' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return reply.status(400).send({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
    reply.send({ token });
  });
}
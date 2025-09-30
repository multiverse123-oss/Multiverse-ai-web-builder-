// backend/src/routes/projects.ts
import { FastifyInstance } from 'fastify';

export async function projectRoutes(fastify: FastifyInstance) {
  // Get user's projects
  fastify.get('/projects', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;
    const projects = await fastify.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    return projects;
  });

  // Create new project
  fastify.post('/projects', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;
    const { name, description } = request.body as { name: string; description: string };
    
    const project = await fastify.prisma.project.create({
      data: {
        name,
        description,
        userId,
        status: 'draft'
      }
    });
    
    return project;
  });

  // Delete project
  fastify.delete('/projects/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;
    
    await fastify.prisma.project.deleteMany({
      where: { id, userId } // Ensure user owns the project
    });
    
    return { message: 'Project deleted' };
  });
}

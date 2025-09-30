// backend/src/routes/analytics.ts
import { FastifyInstance } from 'fastify';
import { AnalyticsService } from '../services/AnalyticsService';

export async function analyticsRoutes(fastify: FastifyInstance) {
  const analyticsService = new AnalyticsService();

  fastify.get('/projects/:projectId/analytics', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { timeframe } = request.query as { timeframe?: '7d' | '30d' | '90d' };
    
    const analytics = await analyticsService.getProjectAnalytics(projectId, timeframe);
    return analytics;
  });

  fastify.get('/users/me/analytics', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;
    const analytics = await analyticsService.getUserAnalytics(userId);
    return analytics;
  });
}

// backend/src/routes/team.ts
export async function teamRoutes(fastify: FastifyInstance) {
  const teamService = new TeamService();

  fastify.post('/projects/:projectId/invite', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { email, role } = request.body as { email: string; role: MemberRole };
    const inviterId = request.user.id;

    const invitation = await teamService.inviteToProject(projectId, inviterId, email, role);
    return invitation;
  });

  fastify.get('/projects/:projectId/members', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const members = await teamService.getProjectMembers(projectId);
    return members;
  });
}

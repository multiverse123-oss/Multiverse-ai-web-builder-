// backend/src/services/AnalyticsService.ts
export class AnalyticsService {
  async trackProjectActivity(projectId: string, userId: string, action: string, targetType: string, details?: any) {
    return await prisma.projectActivity.create({
      data: {
        projectId,
        userId,
        action,
        targetType,
        details,
        createdAt: new Date()
      }
    });
  }

  async getProjectAnalytics(projectId: string, timeframe: '7d' | '30d' | '90d' = '30d') {
    const date = new Date();
    switch (timeframe) {
      case '7d': date.setDate(date.getDate() - 7); break;
      case '30d': date.setDate(date.getDate() - 30); break;
      case '90d': date.setDate(date.getDate() - 90); break;
    }

    const activities = await prisma.projectActivity.findMany({
      where: {
        projectId,
        createdAt: { gte: date }
      },
      include: { user: true }
    });

    // Generate analytics data
    const activityByDay = this.groupActivitiesByDay(activities);
    const userEngagement = this.calculateUserEngagement(activities);
    const popularActions = this.getPopularActions(activities);

    return {
      totalActivities: activities.length,
      activityByDay,
      userEngagement,
      popularActions,
      recentActivities: activities.slice(0, 10)
    };
  }

  async getUserAnalytics(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            activities: true,
            members: true,
            deployments: true
          }
        }
      }
    });

    return {
      totalProjects: projects.length,
      totalDeployments: projects.reduce((sum, project) => sum + project._count.deployments, 0),
      totalCollaborators: projects.reduce((sum, project) => sum + project._count.members, 0),
      projectStats: projects.map(project => ({
        id: project.id,
        name: project.name,
        activityCount: project._count.activities,
        deploymentCount: project._count.deployments,
        collaboratorCount: project._count.members
      }))
    };
  }

  private groupActivitiesByDay(activities: any[]) {
    // Implementation for grouping activities by day
    return activities.reduce((acc, activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateUserEngagement(activities: any[]) {
    // Implementation for calculating user engagement metrics
    return activities.reduce((acc, activity) => {
      const userId = activity.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: activity.user,
          count: 0,
          lastActivity: activity.createdAt
        };
      }
      acc[userId].count++;
      return acc;
    }, {});
  }

  private getPopularActions(activities: any[]) {
    return activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {});
  }
}

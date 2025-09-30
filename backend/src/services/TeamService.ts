// backend/src/services/TeamService.ts
export class TeamService {
  async inviteToProject(projectId: string, inviterId: string, email: string, role: MemberRole) {
    // Find user by email
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    
    if (!invitedUser) {
      // Send invitation email
      await this.sendInvitationEmail(email, inviterId, projectId, role);
    }

    // Create project member record
    const projectMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: invitedUser?.id || 'pending', // Handle pending invitations
        role,
        invitedBy: inviterId,
        status: invitedUser ? 'PENDING' : 'PENDING'
      }
    });

    return projectMember;
  }

  async getProjectMembers(projectId: string) {
    return await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { joinedAt: 'desc' }
    });
  }

  async updateMemberRole(projectId: string, memberId: string, newRole: MemberRole) {
    return await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: newRole }
    });
  }

  async removeMember(projectId: string, memberId: string) {
    return await prisma.projectMember.delete({
      where: { id: memberId }
    });
  }

  private async sendInvitationEmail(email: string, inviterId: string, projectId: string, role: MemberRole) {
    // Implement email sending logic
    console.log(`Sending invitation to ${email} for project ${projectId}`);
  }
}

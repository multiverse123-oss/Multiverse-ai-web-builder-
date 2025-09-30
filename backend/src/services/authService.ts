// backend/src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET!;

  async signup(email: string, password: string, name: string, agreeToTerms: boolean) {
    if (!agreeToTerms) {
      throw new Error('You must agree to the terms and conditions');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscription: {
          create: {
            plan: 'free',
            promptsPerDay: 8,
            promptsUsedToday: 0,
            lastPromptReset: new Date()
          }
        }
      },
      include: { subscription: true }
    });

    const token = jwt.sign({ userId: user.id }, this.JWT_SECRET);
    
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { subscription: true }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Reset prompt counter if it's a new day
    await this.resetDailyPromptsIfNeeded(user.id);

    const token = jwt.sign({ userId: user.id }, this.JWT_SECRET);
    
    return { user: this.sanitizeUser(user), token };
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async resetDailyPromptsIfNeeded(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (user?.subscription) {
      const lastReset = user.subscription.lastPromptReset;
      const today = new Date();
      
      if (lastReset.getDate() !== today.getDate() || 
          lastReset.getMonth() !== today.getMonth() || 
          lastReset.getFullYear() !== today.getFullYear()) {
        
        await prisma.subscription.update({
          where: { userId },
          data: { 
            promptsUsedToday: 0,
            lastPromptReset: today
          }
        });
      }
    }
  }
}

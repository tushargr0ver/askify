import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '../../generated/prisma';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateLimitsDto } from './dto/update-limits.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user ?? undefined;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: updatePreferencesDto,
    });
  }

  async getPreferences(userId: number): Promise<Pick<User, 'preferredModel'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredModel: true },
    });
    return user || { preferredModel: null };
  }

  async canSendMessage(userId: number): Promise<{ canSend: boolean; reason?: string; usage: any }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyLimit: true, monthlyLimit: true },
    });

    if (!user) {
      return { canSend: false, reason: 'User not found', usage: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayUsage = await this.prisma.userUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const monthlyUsage = await this.prisma.userUsage.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        messages: true,
        uploads: true,
        repos: true,
      },
    });

    const todayMessages = (todayUsage?.messages || 0) + (todayUsage?.uploads || 0) + (todayUsage?.repos || 0);
    const monthlyMessages = (monthlyUsage._sum.messages || 0) + (monthlyUsage._sum.uploads || 0) + (monthlyUsage._sum.repos || 0);

    const usage = {
      today: {
        used: todayMessages,
        limit: user.dailyLimit,
        remaining: user.dailyLimit - todayMessages,
        breakdown: {
          messages: todayUsage?.messages || 0,
          uploads: todayUsage?.uploads || 0,
          repos: todayUsage?.repos || 0,
        },
      },
      monthly: {
        used: monthlyMessages,
        limit: user.monthlyLimit,
        remaining: user.monthlyLimit - monthlyMessages,
        breakdown: {
          messages: monthlyUsage._sum.messages || 0,
          uploads: monthlyUsage._sum.uploads || 0,
          repos: monthlyUsage._sum.repos || 0,
        },
      },
    };

    if (todayMessages >= user.dailyLimit) {
      return { 
        canSend: false, 
        reason: `Daily limit of ${user.dailyLimit} actions reached. Try again tomorrow.`,
        usage 
      };
    }

    if (monthlyMessages >= user.monthlyLimit) {
      return { 
        canSend: false, 
        reason: `Monthly limit of ${user.monthlyLimit} actions reached. Limit resets next month.`,
        usage 
      };
    }

    return { canSend: true, usage };
  }

  async incrementUsage(userId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.userUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        messages: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        messages: 1,
      },
    });
  }

  async incrementUploadUsage(userId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.userUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        uploads: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        uploads: 1,
      },
    });
  }

  async incrementRepoUsage(userId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.userUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        repos: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        repos: 1,
      },
    });
  }

  async getUserUsage(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyLimit: true, monthlyLimit: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayUsage = await this.prisma.userUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const monthlyUsage = await this.prisma.userUsage.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        messages: true,
        uploads: true,
        repos: true,
      },
    });

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyUsageData = await this.prisma.userUsage.findMany({
      where: {
        userId,
        date: {
          gte: weekAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        date: true,
        messages: true,
        uploads: true,
        repos: true,
      },
    });

    const todayTotal = (todayUsage?.messages || 0) + (todayUsage?.uploads || 0) + (todayUsage?.repos || 0);
    const monthlyTotal = (monthlyUsage._sum.messages || 0) + (monthlyUsage._sum.uploads || 0) + (monthlyUsage._sum.repos || 0);

    return {
      daily: {
        used: todayTotal,
        limit: user.dailyLimit,
        remaining: Math.max(0, user.dailyLimit - todayTotal),
        percentage: Math.round((todayTotal / user.dailyLimit) * 100),
        breakdown: {
          messages: todayUsage?.messages || 0,
          uploads: todayUsage?.uploads || 0,
          repos: todayUsage?.repos || 0,
        },
      },
      monthly: {
        used: monthlyTotal,
        limit: user.monthlyLimit,
        remaining: Math.max(0, user.monthlyLimit - monthlyTotal),
        percentage: Math.round((monthlyTotal / user.monthlyLimit) * 100),
        breakdown: {
          messages: monthlyUsage._sum.messages || 0,
          uploads: monthlyUsage._sum.uploads || 0,
          repos: monthlyUsage._sum.repos || 0,
        },
      },
      weekly: weeklyUsageData.map(day => ({
        date: day.date,
        total: day.messages + day.uploads + day.repos,
        breakdown: {
          messages: day.messages,
          uploads: day.uploads,
          repos: day.repos,
        },
      })),
    };
  }

  async updateUserLimits(userId: number, updateLimitsDto: UpdateLimitsDto): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateLimitsDto,
    });
  }
}
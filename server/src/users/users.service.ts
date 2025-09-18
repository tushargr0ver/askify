import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '../../generated/prisma';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Find a single user by their unique email
  async findOne(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user ?? undefined;
  }

  // Create a new user
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  // Update user preferences
  async updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: updatePreferencesDto,
    });
  }

  // Get user preferences
  async getPreferences(userId: number): Promise<Pick<User, 'preferredModel'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredModel: true },
    });
    return user || { preferredModel: null };
  }
}
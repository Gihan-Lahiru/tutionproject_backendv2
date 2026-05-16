import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';

const profilePicturesDir = join(process.cwd(), 'uploads', 'profile-pictures');

const ensureProfilePicturesDir = () => {
  if (!existsSync(profilePicturesDir)) {
    mkdirSync(profilePicturesDir, { recursive: true });
  }
};

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  private sanitizeUser(user: any) {
    if (!user) return user;
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      profile_picture: safeUser.profilePicture ?? null,
    };
  }

  @Get()
  async findAll() {
    return { users: await this.usersService.findAll() };
  }

  @Get('students')
  async findStudents(@Query('status') status?: string) {
    const users = await this.usersService.findByRole('student', status);
    return { users: users.map((user) => this.sanitizeUser(user)) };
  }

  @Get('me')
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.id);
    return { user: this.sanitizeUser(user) };
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: any) {
    const user = await this.usersService.update(req.user.id, updateUserDto);
    return { user: this.sanitizeUser(user) };
  }

  @Post('students')
  async createStudent(@Body() createUserDto: any) {
    if (!createUserDto?.email || !createUserDto?.name) {
      throw new BadRequestException('Name and email are required');
    }

    const user = await this.usersService.create({
      ...createUserDto,
      role: 'student',
    });

    return { user: this.sanitizeUser(user) };
  }

  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureProfilePicturesDir();
          cb(null, profilePicturesDir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase() || '.jpg';
          const uniqueName = `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${extension}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const isImage = file.mimetype?.startsWith('image/');
        cb(isImage ? null : new BadRequestException('Only image files are allowed'), isImage);
      },
    }),
  )
  async uploadProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Profile picture file is required');
    }

    const profilePicturePath = `/uploads/profile-pictures/${file.filename}`;
    const user = await this.usersService.update(req.user.id, {
      profilePicture: profilePicturePath,
    });

    return {
      message: 'Profile picture updated successfully',
      profile_picture: profilePicturePath,
      user: this.sanitizeUser(user),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sanitizeUser(await this.usersService.findById(id));
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.sanitizeUser(await this.usersService.update(id, updateUserDto));
  }

  @Put('students/:id')
  async updateStudent(@Param('id') id: string, @Body() updateUserDto: any) {
    const user = await this.usersService.update(id, {
      ...updateUserDto,
      role: 'student',
    });
    return { user: this.sanitizeUser(user) };
  }

  @Post('students/:id/approve')
  async approveStudent(@Param('id') id: string) {
    const user = await this.usersService.approve(id);
    return {
      message: 'Student approved successfully',
      user: this.sanitizeUser(user),
    };
  }

  @Post('students/:id/reject')
  async rejectStudent(@Param('id') id: string, @Body() body: { reason?: string }) {
    const user = await this.usersService.reject(id, body.reason);
    return {
      message: 'Student rejected',
      user: this.sanitizeUser(user),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Delete('students/:id')
  async deleteStudent(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (user.role !== 'student') {
      throw new NotFoundException('Student not found');
    }
    return this.usersService.delete(id);
  }
}

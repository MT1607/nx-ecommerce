import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@org/libs';
import { LoginDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const { first_name, last_name, email, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.users.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
      },
    });
    //TODO: Generate JWT

    const payload = {
      userId: user.id,
      email: user.email,
      roles: `${user.type}`,
    };
    const tokens = await this.generateJwtToken(payload);

    //TODO: Generate OTP and store hashed version in DB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await jwt.sign(
      { otp, userId: user.id, key: 'email-verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );
    await this.prisma.verification.create({
      data: {
        user_id: user.id,
        hash_code: hashedOtp,
        expired_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      },
    });

    const emailBody = `<p> Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`;
    const emailSubject = 'Verify Email E-Commerce';
    await sendEmail(email, emailSubject, emailBody);

    return { tokens, hashedOtp };
  }

  async verifyEmail(verifyToken: string, otp: string) {
    if (!verifyToken) {
      throw new NotFoundException('Verification token not found');
    }

    if (!otp) {
      throw new BadRequestException('OTP is required');
    }

    const decryptedToken = this.jwtService.verify(verifyToken, {
      secret: this.configService.get('JWT_SECRET'),
    });

    if (decryptedToken.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (decryptedToken.key !== 'email-verification') {
      throw new BadRequestException('Invalid verification token');
    }

    const verificationRecord = await this.prisma.verification.findFirst({
      where: {
        user_id: decryptedToken.userId,
      },
    });

    const userRecord = await this.prisma.users.findUnique({
      where: {
        id: decryptedToken.userId,
      },
    });

    if (userRecord?.is_verified) {
      return { message: 'Email is already verified' };
    }

    if (!verificationRecord) {
      throw new NotFoundException('Verification record not found');
    }

    if (verificationRecord.expired_at < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: decryptedToken.userId },
        data: { is_verified: true },
      }),
      this.prisma.verification.deleteMany({
        where: { user_id: decryptedToken.userId },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const userRecord = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!userRecord) {
      throw new NotFoundException('User not registered');
    }

    const isPasswordValid = await bcrypt.compare(password, userRecord.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    const payload = {
      userId: userRecord.id,
      email: userRecord.email,
      roles: `${userRecord.type}`,
    };

    return await this.generateJwtToken(payload);
  }

  async generateJwtToken(payload: {
    userId: string;
    email: string;
    roles: string;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}

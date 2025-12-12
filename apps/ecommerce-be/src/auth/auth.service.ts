import { HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '../prisma.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@org/libs';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    // const payload = {
    //   userId: user.id,
    //   email: user.email,
    //   roles: [`${user.type}`],
    // };

    // const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    //   expiresIn: '1h',
    // });
    // const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    //   expiresIn: '7d',
    // });

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

    return {
      message: 'User registered successfully. Please verify your email.',
      status: HttpStatus.CREATED,
    };
  }

  async verifyEmail(userId: string, otp: string) {
    const verificationRecord = await this.prisma.verification.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    if (!verificationRecord) {
      return {
        message: 'No verification record found.',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    if (verificationRecord.expired_at < new Date()) {
      return {
        message: 'OTP has expired.',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    const isOtpValid = (await jwt.verify(
      verificationRecord.hash_code,
      process.env.JWT_SECRET!
    )) as { otp: string; userId: string; key: string };

    if (isOtpValid.otp !== otp) {
      return {
        message: 'Invalid OTP.',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: { is_verified: true },
    });

    await this.prisma.verification.delete({
      where: { id: verificationRecord.id },
    });

    return {
      message: 'Email verified successfully.',
      status: HttpStatus.OK,
    };
  }

  findAll() {
    return this.prisma.users.findFirst();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

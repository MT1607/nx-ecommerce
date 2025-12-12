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

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { LoginDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const result = await this.authService.register(registerDto);

    if (result.tokens.refreshToken) {
      res.setCookie('refresh-token', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    if (result.tokens.accessToken) {
      res.setCookie('access-token', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });
    }

    if (result.hashedOtp) {
      res.cookie('email-verification', result.hashedOtp, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000, // 5 minutes
      });
    }

    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'User registered successfully' });
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('otp') otp: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    const token = req.cookies['email-verification'];
    if (!token) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: 'Invalid or expired verification token',
      });
    }
    const message = this.authService.verifyEmail(token, otp);
    return res.status(HttpStatus.OK).send({ message });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const result = await this.authService.login(loginDto);

    if (result.refreshToken) {
      res.setCookie('refresh-token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    if (result.accessToken) {
      res.setCookie('access-token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });
    }

    return res.status(HttpStatus.OK).send({ message: 'Login successful' });
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('refresh-token', {
      path: '/api/auth',
    });
    res.clearCookie('access-token', {
      path: '/api/auth',
    });
    return res.status(HttpStatus.OK).send({ message: 'Logout successful' });
  }
}

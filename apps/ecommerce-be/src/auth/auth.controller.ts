import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
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

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}

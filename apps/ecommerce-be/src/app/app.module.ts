import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import {
  ArcjetModule,
  detectBot,
  fixedWindow,
  shield,
  validateEmail,
  tokenBucket,
  ArcjetGuard,
} from '@arcjet/nest';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      characteristics: ['ip.src'],
      rules: [
        shield({ mode: 'LIVE' }),
        detectBot({ mode: 'LIVE', allow: ['CATEGORY:SEARCH_ENGINE'] }),
        tokenBucket({
          mode: 'LIVE',
          refillRate: 5, // Refill 5 tokens per interval
          interval: 10, // Refill every 10 seconds
          capacity: 10, // Bucket capacity of 10 tokens
        }),
        validateEmail({
          mode: 'LIVE',
          deny: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
        }),
      ],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}

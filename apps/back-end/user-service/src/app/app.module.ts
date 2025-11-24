import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.USER_SERVICE_DATABASE_USER,
      password: process.env.USER_SERVICE_DATABASE_PASSWORD,
      database: process.env.USER_SERVICE_DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entities: [User],
    }),
    UsersModule,
  ],
})
export class AppModule {}

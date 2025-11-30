import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Profile, User } from '@ecommerce/libs';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.USER_SERVICE_DATABASE_HOST,
      port: parseInt(process.env.USER_SERVICE_DATABASE_PORT || '5432', 10),
      username: process.env.USER_SERVICE_DATABASE_USER,
      password: process.env.USER_SERVICE_DATABASE_PASSWORD,
      database: process.env.USER_SERVICE_DATABASE_NAME,
      autoLoadEntities: true,
      entities: [User, Profile],
    }),
    UsersModule,
    ProfilesModule,
  ],
})
export class AppModule {}

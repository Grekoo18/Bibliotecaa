import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RolesInfoController } from './roles.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as StringValue,
      },
    }),
  ],
  controllers: [AuthController, RolesInfoController],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [JwtStrategy],
})
export class AuthModule {}

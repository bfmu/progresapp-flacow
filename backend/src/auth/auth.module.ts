import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstans } from './constants/jwt.constant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UsersModule, 
    JwtModule.register({
      global:true,
      secret: jwtConstans.secret,
      signOptions: {expiresIn: '3600s'}
    }),
    TypeOrmModule.forFeature([PasswordResetToken]),
    MailModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}

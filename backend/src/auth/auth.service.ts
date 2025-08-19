import { BadRequestException, Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Repository } from 'typeorm';
import { generateResetToken, hashResetToken } from './utils/password-reset.util';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { IsNull } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register({ full_name, email, password }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    return await this.usersService.create({
      full_name,
      email,
      password: await bcryptjs.hash(password, 10),
    });
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (!user) {
      throw new BadRequestException('Dont exists user');
    }

    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      throw new BadRequestException('Invalid password');
    }

    const roles = user.roles.map((role) => role.name)

    const payload = { email: user.email, sub: user.id, roles };

    const jwtToken = await this.jwtService.signAsync(payload);

    return {
      accessToken: jwtToken
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    // No revelar existencia del usuario: responder 200 siempre
    if(!user) {
      return { ok: true };
    }
    try {
      const token = generateResetToken();
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2);// 2 hours

      await this.passwordResetTokenRepository.save({user, tokenHash, expiresAt});

      const frontendUrl = this.configService.get('FRONTEND_BASE_URL')
      const resetUrl = `${frontendUrl}/app/reset-password?token=${token}`;
      await this.mailService.sendPasswordResetEmail(email, resetUrl);
      return { ok: true, sent: true };
    } catch (err) {
      Logger.error('Failed to send password reset email', err);
      // Propagar error de servicio de correo
      throw new ServiceUnavailableException({ error: 'email_not_sent', message: 'Email service unavailable' });
    }
  }

  async resetPassword(tokenPlainText: string, newPassword: string) {
    const tokenHash = hashResetToken(tokenPlainText);
    const entity = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash, usedAt: IsNull() },
      relations: ['user'],
    });

    if(!entity) {
      throw new BadRequestException('Invalid token');
    }

    if(entity.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Token expired');
    }

    const user = entity.user;
    await this.usersService.update(user.id, {password: await bcryptjs.hash(newPassword, 10)});
    await this.passwordResetTokenRepository.update(entity.id, {usedAt: new Date()});
    return {message: 'Password reset successfully'};
  }


}

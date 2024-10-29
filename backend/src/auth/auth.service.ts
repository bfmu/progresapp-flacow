import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
}

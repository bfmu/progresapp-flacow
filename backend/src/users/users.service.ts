import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/entities/role.entity';

import * as bcryptjs from 'bcryptjs';
import { ActiveUserI } from 'src/common/active-user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repositoryUser: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Obtiene el rol 'user' por su nombre
    const userRole = await this.rolesService.findByName('user');
    if (!userRole) {
      throw new Error('Role "user" not found.'); // Asegúrate de que el rol existe
    }

    // Crea el nuevo usuario y le asigna el rol 'user'
    const newUser = new User();
    newUser.full_name = createUserDto.full_name;
    newUser.email = createUserDto.email;
    newUser.password = createUserDto.password;
    newUser.roles = [userRole];

    return await this.repositoryUser.save(newUser);
  }

  async findOneByEmail(email: string) {
    return await this.repositoryUser.findOneBy({ email });
  }

  async findOneByEmailWithPassword(email: string) {
    return await this.repositoryUser.findOne({
      where: { email },
      select: ['id', 'full_name', 'email', 'password'],
    });
  }

  async findByName(full_name: string) {
    return await this.repositoryUser.findOneBy({ full_name });
  }

  async findAll() {
    return await this.repositoryUser.find();
  }

  async findOne(id: number) {
    return await this.repositoryUser.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.repositoryUser.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.repositoryUser.softDelete(id);
  }

  async createAdminUser(
    full_name: string,
    email: string,
    password: string,
    roles: Role[],
  ) {
    const adminUser = new User();
    adminUser.full_name = full_name;
    adminUser.email = email;
    adminUser.password = await bcryptjs.hash(password, 10);
    adminUser.roles = roles;

    return await this.repositoryUser.save(adminUser);
  }

  async findMe(user: ActiveUserI) {
    const userDB = await this.repositoryUser.findOneBy({ id: user.sub });
    return {
      name: userDB.full_name,
      email: userDB.email,
      roles: userDB.roles.map(role => role.name)
    };
  }
}

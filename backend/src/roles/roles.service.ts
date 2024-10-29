import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    return await this.rolesRepository.save(createRoleDto);
  }

  async findAll() {
    return await this.rolesRepository.find();
  }

  async findOne(id: number) {
    return await this.rolesRepository.findOneBy({ id });
  }

  async findByName(name: string) {
    return await this.rolesRepository.findOneBy({ name });
  }

  async createRoleIfNotExists(name: string) {
    const role = await this.rolesRepository.findOneBy({ name });
    if (!role) {
      try {
        const newRole: CreateRoleDto = { name };
        await this.rolesRepository.save(newRole);
      } catch {
        throw new BadRequestException('dont create a new role maybe role exists')
      }
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    return await this.rolesRepository.update(id, updateRoleDto);
  }

  async remove(id: number) {
    return await this.rolesRepository.softDelete(id);
  }
}

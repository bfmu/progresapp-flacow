import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async onModuleInit() {
    console.log('Ejecutando datos de inicializacion...');

    // Crear roles predeterminados si no existen
    await this.rolesService.createRoleIfNotExists('admin');
    await this.rolesService.createRoleIfNotExists('user');

    // Crear usuario de administrador si no existe
    const adminUser = await this.usersService.findOneByEmail('admin@admin.com');
    if (!adminUser) {
      const adminRole = await this.rolesService.findByName('admin');
      await this.usersService.createAdminUser('admin', 'admin@admin.com', 'admin', [adminRole])
    }
  }
}

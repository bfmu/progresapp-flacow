import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService, // Inyecta ConfigService
  ) {}

  async onModuleInit() {
    console.log('Ejecutando datos de inicializacion...');

    // Obtener correo y contraseña de .env con valores por defecto
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@flacow.com',
    );
    const adminPassword = this.configService.get<string>(
      'ADMIN_PASSWORD',
      'defaultpassword',
    );

    // Crear roles predeterminados si no existen
    await this.rolesService.createRoleIfNotExists('admin');
    await this.rolesService.createRoleIfNotExists('user');

    // Crear usuario de administrador si no existe
    const adminUser = await this.usersService.findOneByEmail(adminEmail);
    if (!adminUser) {
      const adminRole = await this.rolesService.findByName('admin');
      await this.usersService.createAdminUser(
        'admin',
        adminEmail,
        adminPassword,
        [adminRole],
      );
    }
  }
}

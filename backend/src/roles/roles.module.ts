import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(()=> UsersModule)],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}

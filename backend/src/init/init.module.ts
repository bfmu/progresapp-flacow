import { Module } from '@nestjs/common';
import { InitService } from './init/init.service';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  providers: [InitService],
  imports: [UsersModule, RolesModule]
})
export class InitModule {}

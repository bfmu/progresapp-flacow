import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (role) => {
  return SetMetadata(ROLES_KEY, role);
};

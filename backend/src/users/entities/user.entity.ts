import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @DeleteDateColumn({ select: false })
  deleteAt: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'users_roles' })
  roles: Role[];
}

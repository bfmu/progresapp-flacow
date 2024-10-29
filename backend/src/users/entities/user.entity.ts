import { Role } from 'src/roles/entities/role.entity';
import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'users_roles' })
  roles: Role[];
}

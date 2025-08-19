import { User } from "src/users/entities/user.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Index,
} from 'typeorm';

@Entity()
export class PasswordResetToken{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, {nullable: false})
    user: User;

    @Index()
    @Column({length: 64})
    tokenHash: string;

    @Index()
    @Column({type: 'timestamptz'})
    expiresAt: Date;

    
    @CreateDateColumn({type: 'timestamptz'})
    createdAt: Date;


    @Column({type: 'timestamptz', nullable: true, default: null})
    usedAt: Date;

}
import { Exercise } from 'src/exercises/entities/exercise.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LiftingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.id, {
    nullable: false,
    eager: true,
  })
  exercise: Exercise;

  @Column('float')
  weight: number;

  @Column('date')
  date: Date;

  @Column('int')
  repeatNumber: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;
}

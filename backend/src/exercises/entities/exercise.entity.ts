import { LiftingHistory } from 'src/lifting-histories/entities/lifting-history.entity';
import { Muscle } from 'src/muscles/entities/muscle.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;

  @ManyToOne(() => Muscle, (muscle) => muscle.id, { eager: true })
  muscle: Muscle;

  @OneToMany(() => LiftingHistory, (liftingHistory) => liftingHistory.exercise)
  liftingHistory: LiftingHistory[];
}

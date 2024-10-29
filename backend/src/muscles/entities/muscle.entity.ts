import { Exercise } from "src/exercises/entities/exercise.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Muscle {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Exercise,(exercise) => exercise.muscle)
    exercises: Exercise[];
}

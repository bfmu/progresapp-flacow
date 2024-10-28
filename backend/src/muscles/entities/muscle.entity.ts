import { Exercise } from "src/exercises/entities/exercise.entity";
import { Column, DeleteDateColumn, Entity, OneToMany } from "typeorm";

@Entity()
export class Muscle {
    
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    name: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Exercise,(exercise) => exercise.muscle)
    exercises: Exercise[];
}

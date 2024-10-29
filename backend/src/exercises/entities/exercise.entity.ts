import { Muscle } from "src/muscles/entities/muscle.entity";
import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Exercise {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(()=> Muscle, (muscle) => muscle.id, {eager: true})
    muscle: Muscle
}

import { Muscle } from "src/muscles/entities/muscle.entity";
import { Column, DeleteDateColumn, Entity, ManyToOne } from "typeorm";

@Entity()
export class Exercise {

    @Column({ primary: true, generated: true })
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

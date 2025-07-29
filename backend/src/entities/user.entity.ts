import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectId } from "mongodb";

@Entity({ name: "users" })
export class Users {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    phoneNumber!: string;

    @Column({ default: 'user' })
    role!: 'user' | 'admin';

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
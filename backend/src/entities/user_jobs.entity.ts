
// src/entities/user_jobs.entity.ts
import { Entity, Column, ObjectIdColumn, CreateDateColumn, Index } from "typeorm";
import { ObjectId } from "mongodb";

@Entity({ name: "user_jobs" })
export class UserJob {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    @Index()
    userId!: ObjectId;

    @Column()
    @Index()
    jobId!: ObjectId;

    @Column({ default: false })
    isBookmarked!: boolean;

    @Column({ nullable: true })
    lastAccessed?: Date;

    @Column({ nullable: true })
    appliedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
// src/entities/job.entity.ts
import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { ObjectId } from "mongodb";

@Entity({ name: "jobs" })
export class Job {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    @Index({ unique: true })
    tavilyId!: string;

    @Column()
    @Index({ fulltext: true })
    title!: string;

    @Column({ type: 'text' })
    @Index({ fulltext: true })
    description!: string;

    @Column({ type: 'text' })
    shortDescription!: string;

    @Column('simple-array')
    @Index({ fulltext: true })
    skills!: string[];

    @Column()
    company!: string;

    @Column({ nullable: true })
    companyLogo?: string;

    @Column()
    location!: string;

    @Column()
    url!: string;

    @Column({ nullable: true })
    salary?: string;

    @Column({ nullable: true })
    employmentType?: string; // Full-time, Part-time, Contract, etc.

    @Column({ nullable: true })
    postedDate?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ default: 0 })
    popularityScore!: number;

    @Column({ default: 0 })
    tavilyScore!: number; // Tavily's relevance score

    @Column({ type: 'simple-array', nullable: true })
    tags?: string[];

    @Column({ default: false })
    isRemote!: boolean;
}

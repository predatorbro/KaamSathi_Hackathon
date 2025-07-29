import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { ObjectId } from "mongodb";

@Entity({ name: "courses" })
export class Course {
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
    categories!: string[];

    @Column()
    provider!: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column()
    url!: string;

    @Column({ default: false })
    isFree!: boolean;

    @Column({ default: false })
    isVideo!: boolean;

    @Column({ nullable: true })
    channelName?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ default: 0 })
    popularityScore!: number;

    @Column({ default: 0 })
    tavilyScore!: number; // New field for Tavily's relevance score

    @Column({ type: 'simple-array', nullable: true })
    tags?: string[];
}
import { Entity, Column, ObjectIdColumn, CreateDateColumn, Index } from "typeorm";
import { ObjectId } from "mongodb";

@Entity({ name: "user_courses" })
export class UserCourse {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    @Index()
    userId!: ObjectId;

    @Column()
    @Index()
    courseId!: ObjectId;

    @Column({ default: false })
    isBookmarked!: boolean;

    @Column({ nullable: true })
    lastAccessed?: Date;

    @Column({ nullable: true })
    completedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
import {
	BaseEntity,
	Column,
	Entity,
	PrimaryGeneratedColumn,
	Generated,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	ManyToMany,
} from "typeorm";
import { User } from "../User/User";
import { Post } from "../Post/Post";

@Entity("pets")
export class Pet extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	@Generated("uuid")
	public uuid: string;

	@Column({ type: "varchar", nullable: false })
	public name: string;

	@Column({ type: "varchar", nullable: false })
	public species: string;

	@Column({ type: "varchar", nullable: false })
	public birthdate: string;

	@Column({ type: "varchar", nullable: false })
	public race: string;

	@Column({ type: "varchar", nullable: false })
	public gender: string;

	@ManyToOne(() => User, (user) => user.pets)
	public owner: User;

	@OneToMany(() => Post, (post) => post.pet)
	public posts: Post[];

	@CreateDateColumn()
	public createdAt: Date

	@UpdateDateColumn()
	public updatedAt: Date

}

import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { User } from "../entity/User/User";

import { getConnection, createQueryBuilder } from "typeorm";
import { PasswordService } from "../services/passwordService";
import authMiddleware from "../middleware/auth";
import createUserMiddleware from "../middleware/user/createUser";

export const userController = Router();

//auth middleware
userController.use("/getMe", authMiddleware);
userController.use("/edit", authMiddleware);

// other middleware
userController.use("/createUser", createUserMiddleware);

userController.post(
	"/edit",
	asyncHandler(async (req: Request, res: Response) => {

		await getConnection()
			.createQueryBuilder()
			.update(User)
			.set({
				name: req.body.name,
				username: req.body.username,
				email: req.body.email,
			})
			.where({ uuid: req.body.userUuid })
			.execute();


		res.status(200).send({ message: "success" })
	})
);



userController.post(
	"/createUser",
	asyncHandler(async (req: Request, res: Response) => {
		/**
				{
						"username" : "johannes.krabbe",
						"email" : "foo@bar.net",
						"password" : "qwerty",
						"name" : "Johannes Krabbe",
						"bio" : "I am Johannes, 19, from Berlin",
						"profilePictureUrl" : "https://picsum.photos/200"
				}
				*/

		if ((await User.find({ username: req.body.username })).length !== 0) {
			res.status(409).send({ message: "There is already an account with this username" });
		} else if ((await User.find({ email: req.body.email })).length !== 0) {
			console.log(await User.find({ email: req.body.email }))
			res.status(409).send({ message: "There is already an account with this email" });
		} else {
			const passwordData = await PasswordService.hashPassword(
				req.body.password
			);

			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					username: req.body.username,
					email: req.body.email,
					passwordHash: passwordData.hashPassword,
					passwordSalt: passwordData.salt,
					name: req.body.name,
					bio: req.body.bio,
					profilePictureUrl: req.body.profilePictureUrl,
				})
				.execute();

			// TODO make better return
			res.status(200).send(req.body);
		}
	})
);

userController.get(
	"/getUser/:userName",
	asyncHandler(async (req: Request, res: Response) => {
		const user = await User.findOne({ uuid: req.body.userUuid });
		const data = {
			username: user.username,
			name: user.name,
			bio: user.bio,
			pets: user.pets,
		};
		res.status(200).send(data);
	})
);

userController.get(
	"/getMe",
	asyncHandler(async (req: Request, res: Response) => {
		const user = await User.findOne({ uuid: req.body.userUuid }, { relations: ["pets", "posts", "posts.pet"] })

		console.log(user)

		const data = {
			name: user.name,
			username: user.username,
			email: user.email,
			bio: user.bio,
			profilePictureUrl: user.profilePictureUrl,
			pets: user.pets,
			posts: user.posts.reverse()
		}

		res.status(200).send(data);
	})
);

userController.post(
	"/login",
	asyncHandler(async (req: Request, res: Response) => {
		const user = await User.findOne({ username: req.body.username });

		const failMessage = "Username or Password wrong. Please try again.";

		if (!user) {
			res.status(400).json({ message: failMessage });
			return;
		}
		const isValid = await PasswordService.validatePassword(
			user.passwordHash,
			user.passwordSalt,
			req.body.password
		);
		if (isValid) {
			const token = PasswordService.createToken(user.uuid);
			res.status(200).json({ token });
		} else {
			res.status(400).json({ message: failMessage });
		}
	})
);

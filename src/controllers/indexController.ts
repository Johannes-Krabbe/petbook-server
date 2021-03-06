import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PasswordService } from "../services/passwordService";

export const indexController = Router();

indexController.post(
	"/hashPassword",
	asyncHandler(async (req: Request, res: Response) => {
		PasswordService.hashPassword(req.body.password);

		res
			.status(200)
			.send(
				JSON.stringify(await PasswordService.hashPassword(req.body.password))
			);
	})
);

indexController.get(
	"/hello-world",
	asyncHandler(async (req: Request, res: Response) => {
		res.status(200).send("Hello, World!");
	})
);

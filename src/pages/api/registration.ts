import type { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";
import type { User } from "@/database";
import { createUser } from "@/database";

type Response =
  | {
      email: string;
    }
  | { error: string };

const registrationSchema = Joi.object<User>({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(5).max(100),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.min(Math.random() * 10000, 3000))
  );

  if (req.method !== "POST")
    res.status(405).json({ error: "Invalid HTTP method" });

  const { error, value } = registrationSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.message });
  }

  if (!value) {
    res.status(400).json({ error: "Unhandled validation error" });
    return;
  }

  const createdUser = await createUser(value);

  if ("error" in createdUser && createdUser.error) {
    res.status(500).json({ error: createdUser.error });
    return;
  }

  if (createdUser.user?.email) {
    res.status(200).json({ email: createdUser.user.email });
    return;
  }

  res.status(400).json({ error: "Unhandled error" });
}

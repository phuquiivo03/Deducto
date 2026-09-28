import z from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type IUser = z.infer<typeof userSchema>;

export const IUserCreateSchema = userSchema.omit({
  id: true,
  created_at: true,
});

export type IUserCreate = z.infer<typeof IUserCreateSchema>;

export const IUserUpdateSchema = userSchema.omit({
  created_at: true,
});

export type IUserUpdate = z.infer<typeof IUserUpdateSchema>;

import * as z from "zod";

export const QuestionSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(20).max(5000),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});

export const AnswerSchema = z.object({
  answer: z.string().min(100).max(5000),
});

export const ProfileSchema = z.object({
  name: z.string().min(2).max(30),
  username: z.string().min(6).max(30),
  portfolioWebsite: z.string().url(),
  location: z.string().min(2).max(30),
  bio: z.string().min(5).max(140),
});

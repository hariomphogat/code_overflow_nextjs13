"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "./shared.types";
import Question from "../models/question.model";

// get the user by the userID
export async function getUserByid(param: string) {
  try {
    connectToDatabase();
    const userId = param;

    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error: any) {
    throw new Error(`Unable to fetch user:${error}`);
  }
}

// create a user in database
export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

// update a user in database
export async function updateUser(userData: UpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, updateData, path } = userData;
    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

// delete a user in database
export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOneAndDelete({ clerkId });
    if (!user) {
      throw new Error("User not found");
    }
    // get question ids
    const userQuestionIds = await Question.find({ author: user._id }).distinct(
      "_id"
    );
    // delete user questions
    await Question.deleteMany({ author: user._id });

    // TODO: delte user answers,comments, likes etc.
    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

"use server";

import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";

export async function getUserByid(param: string) {
  try {
    connectToDatabase();
    const userId = param;
    console.log("The user id is:", userId);
    const user = await User.findOne({ clerkId: userId });
    console.log(user);
    return user;
  } catch (error: any) {
    throw new Error(`Unable to fetch user:${error}`);
  }
}

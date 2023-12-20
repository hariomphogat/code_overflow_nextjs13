"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import Question from "../models/question.model";
import Tag from "../models/tag.model";
import { _FilterQuery } from "mongoose";
import Answer from "../models/answer.model";
// get the user by the userID
export async function getUserById(params: GetUserByIdParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOne({ clerkId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// create a user in database
export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// update a user in database
export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
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

    // Delete user from database
    // and questions, answers, comments, etc.

    // get user question ids
    // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

    // delete user questions
    await Question.deleteMany({ author: user._id });

    // TODO: delete user answers, comments, etc.

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get all users from database
export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    // const { page = 1, pageSize = 20, filter, searchQuery } = params;
    const users = await User.find({}).sort({ createdAt: -1 });
    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// save a question
let isSaving = false;
export async function saveQuestion(params: ToggleSaveQuestionParams) {
  try {
    if (isSaving) {
      // saving question is already in process, ignore the call
      return;
    }
    isSaving = true;
    connectToDatabase();
    const { userId, questionId, hasSaved, path } = params;
    let updateQuery = {};
    if (hasSaved) {
      // question is already saved, user is removing the saved question
      updateQuery = { $pull: { saved: questionId } };
    } else {
      // adding a new save
      updateQuery = { $addToSet: { saved: questionId } };
    }
    const user = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    if (!user) {
      throw new Error("User not found!");
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    isSaving = false;
  }
}

// fetch all saved question
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    const {
      clerkId,
      // filter,
      // page = 1,
      // pageSize = 10,
      searchQuery,
    } = params;

    const query: _FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found!");
    }
    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// fetch user profile
export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOne({ clerkId });
    if (!user) {
      throw new Error("User Not Found");
    }
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return { user, totalAnswers, totalQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get all question by userId
export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;
    const totalQuestions = Question.countDocuments({ author: userId });
    const skip = (page - 1) * pageSize;
    const userQuestions = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate([
        { path: "author", model: User, select: "_id clerkId name picture" },
        { path: "tags", model: Tag, select: "_id name" },
      ]);
    return { totalQuestions, questions: userQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get all ANSWERS by userId
export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;
    const totalAnswers = Answer.countDocuments({ author: userId });
    const skip = (page - 1) * pageSize;
    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate([
        { path: "author", model: User, select: "_id clerkId name picture" },
        { path: "question", model: Question, select: "_id title" },
      ]);
    return { totalAnswers, answers: userAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// export async function getAllUsers(params:GetAllUsersParams){
//     try {
//       connectToDatabase();

//     } catch (error) {
//   console.log(error);
//   throw error;
//     }
//   }

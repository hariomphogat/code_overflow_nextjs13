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
import Answer from "../models/answer.model";
import { FilterQuery } from "mongoose";
import { BadgeCriteriaType } from "@/types";
import { assignBadges } from "../utils";

// get the user by the userID
export async function getUserById(params: GetUserByIdParams) {
  try {
    await connectToDatabase();
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
    await connectToDatabase();

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
    await connectToDatabase();

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
    await connectToDatabase();

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
    await connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: FilterQuery<typeof User> = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;

      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;

      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;

      default:
        break;
    }
    const skipAmount = (page - 1) * pageSize;

    const users = await User.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);
    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;
    return { users, isNext };
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
    await connectToDatabase();
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
    await connectToDatabase();
    const { clerkId, filter, page = 1, pageSize = 20, searchQuery } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? [
          { title: { $regex: new RegExp(searchQuery, "i") } },
          { content: { $regex: new RegExp(searchQuery, "i") } },
        ]
      : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_voted":
        sortOptions = { votes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;

      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        skip: skipAmount,
        limit: pageSize,
        sort: sortOptions,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    const nextQue = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        skip: skipAmount + pageSize,
        limit: 1,
        sort: sortOptions,
      },
    });
    const isNext = nextQue.saved.length > 0;

    if (!user) {
      throw new Error("User not found!");
    }
    const savedQuestions = user.saved;

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// fetch user profile
export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOne({ clerkId });
    if (!user) {
      throw new Error("User Not Found");
    }
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    // fetch total question upvotes received by the user
    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upVotes: { $size: "$upVotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upVotes" },
        },
      },
    ]);

    // fetch total answer upvotes received by the user
    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      { $project: { _id: 0, upVotes: { $size: "$upVotes" } } },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upVotes" },
        },
      },
    ]);
    // fetch total question views received by the user
    const [questionViews] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const criteria = [
      { type: "QUESTION_COUNT" as BadgeCriteriaType, count: totalQuestions },
      { type: "ANSWER_COUNT" as BadgeCriteriaType, count: totalAnswers },
      {
        type: "QUESTION_UPVOTES" as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: "ANSWER_UPVOTES" as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: "TOTAL_VIEWS" as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ];

    const BadgeCounts = assignBadges({ criteria });
    return {
      user,
      totalAnswers,
      totalQuestions,
      BadgeCounts,
      reputation: user.reputation,
    };
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

    const totalQuestions = await Question.countDocuments({ author: userId });

    const skipAmount = (page - 1) * pageSize;
    const userQuestions = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate([
        { path: "author", model: User, select: "_id clerkId name picture" },
        { path: "tags", model: Tag, select: "_id name" },
      ]);
    const isNext = totalQuestions > skipAmount + userQuestions.length;
    return { totalQuestions, questions: userQuestions, isNext };
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
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const skipAmount = (page - 1) * pageSize;
    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate([
        { path: "author", model: User, select: "_id clerkId name picture" },
        { path: "question", model: Question, select: "_id title" },
      ]);
    const isNext = totalAnswers > skipAmount + userAnswers.length;
    return { totalAnswers, answers: userAnswers, isNext };
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

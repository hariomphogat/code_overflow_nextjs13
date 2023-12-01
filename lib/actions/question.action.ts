"use server";

import { revalidatePath } from "next/cache";
import Question from "../models/question.model";
import Tag from "../models/tag.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";

// get all questions
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });
    return { questions };
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

//  create a question
export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // create the question
    const question = await Question.create({
      title,
      content,
      author,
    });
    const tagDocuments = [];
    // create the tag or get it from database
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        {
          name: { $regex: new RegExp(`^${tag}$`, "i") },
        },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }
    // update the Question database
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    //  Create an interaction record for the user's ask_question action.
    // Increment author's reputation by +5 for creating a question.
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`unbale to create post:${error}`);
  }
}

// get question details
export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();
    const { questionId } = params;
    const question = Question.findById({ _id: JSON.parse(questionId) })
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });
    if (!question) throw Error("No Question found");
    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Upvote a question
let isUpvoting = false;
export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    if (isUpvoting) {
      // Upvoting is already in progress, ignore this call
      return;
    }

    isUpvoting = true;

    connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasupVoted) {
      // User is removing the upvote
      updateQuery = { $pull: { upVotes: userId } };
    } else if (hasdownVoted) {
      // User is switching from downvote to upvote
      updateQuery = {
        $pull: { downVotes: userId },
        $addToSet: { upVotes: userId },
      };
    } else {
      // User is adding a new upvote
      updateQuery = { $addToSet: { upVotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) throw new Error("Question Not Found");

    // TODO: Update user Reputation by +10

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    isUpvoting = false;
  }
}

// DownVote a question
let isDownvoting = false;
export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    if (isDownvoting) {
      // Downvoting is already in progress, ignore this call
      return;
    }
    isDownvoting = true;

    connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      // User is removing the downvote
      updateQuery = { $pull: { downVotes: userId } };
    } else if (hasupVoted) {
      // User is switching from upvote to downvote
      updateQuery = {
        $pull: { upVotes: userId },
        $addToSet: { downVotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downVotes: userId } };
    }
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) throw new Error("Question Not Found");

    // TODO: Update user Reputaion by +10

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    isDownvoting = false;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import Answer from "../models/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Question from "../models/question.model";
import Interaction from "../models/interaction.model";

// create an answer
export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();
    const { author, question, content, path } = params;
    const newAnswer = await Answer.create({
      author,
      question,
      content,
    });

    // Add the answer to the question's answer array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // TODO: Add interaction...
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get all answers by questionId
export async function getAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();
    const { questionId, sortBy, page = 1, pageSize = 10 } = params;

    let sortOptions = {};
    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upVotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upVotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const isNext = totalAnswers > skipAmount + answers.length;
    return { answers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// upvote an answer
let isUpvoting = false;
export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    if (isUpvoting) {
      // Upvoting is already in progress, ignore this call
      return;
    }
    isUpvoting = true;
    connectToDatabase();
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};
    if (hasupVoted) {
      // user is removing the upovote
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
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) throw new Error("Answer not found.");

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    isUpvoting = false;
  }
}

// downVote an Answer
let isDownvoting = false;
export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    if (isDownvoting) {
      // Downvoting is already in progress, ignore this call
      return;
    }
    isDownvoting = true;
    connectToDatabase();
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;
    let updateQuery = {};
    if (hasdownVoted) {
      // user is removing the downovote
      updateQuery = { $pull: { downVotes: userId } };
    } else if (hasupVoted) {
      // User is switching from upvote to downvote
      updateQuery = {
        $pull: { upVotes: userId },
        $addToSet: { downVotes: userId },
      };
    } else {
      // User is adding a new downvote
      updateQuery = { $addToSet: { downVotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) throw new Error("Answer not found.");

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    isDownvoting = false;
  }
}

// Delete an answer
export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectToDatabase();
    const { answerId, path } = params;
    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer Not Found");
    }

    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );
    await Interaction.deleteMany({ answer: answerId });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

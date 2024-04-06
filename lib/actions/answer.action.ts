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
import User from "../models/user.model";

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
    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // Add interaction...
    await Interaction.create({
      user: author,
      action: "answer",
      question,
      answer: newAnswer._id,
      tags: questionObject.tags,
    });
    // Add Reputation
    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });
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

    // Add Interaction
    !hasupVoted
      ? await Interaction.create({
          user: userId,
          action: "upvote_answer",
          question: answer.question,
          answer: answerId,
          tags: answer.question.tags,
        })
      : await Interaction.deleteOne({
          answer: answerId,
          action: "upvote_answer",
        });

    hasdownVoted &&
      (await Interaction.deleteOne({
        answer: answerId,
        action: "downvote_answer",
      }));

    // add Reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? 4 : hasupVoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasdownVoted ? 20 : hasupVoted ? -10 : 10 },
    });

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

    // Add Interaction
    !hasdownVoted
      ? await Interaction.create({
          user: userId,
          action: "downvote_answer",
          question: answer.question,
          answer: answerId,
          tags: answer.question.tags,
        })
      : await Interaction.deleteOne({
          answer: answerId,
          action: "downvote_answer",
        });

    hasupVoted &&
      (await Interaction.deleteOne({
        answer: answerId,
        action: "upvote_answer",
      }));

    // add Reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -4 : hasdownVoted ? 2 : -2 },
    });
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasupVoted ? -20 : hasdownVoted ? 10 : -10 },
    });

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
    const { answerId, path, clerkId } = params;
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw new Error("Answer Not Found");
    }
    // add another security layer by checking if the author and the current user is same.
    const user = await User.findOne({ clerkId });

    if (user?._id.toString() !== answer.author.toString())
      return console.log("restricted");

    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );
    await Interaction.deleteMany({ answer: answerId });
    // decrease the reputation of the user by -10
    await User.findByIdAndUpdate(user._id, { $inc: { reputation: -10 } });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

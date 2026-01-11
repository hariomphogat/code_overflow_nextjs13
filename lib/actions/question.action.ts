"use server";

import { revalidatePath } from "next/cache";
import Question from "../models/question.model";
import Tag from "../models/tag.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
  RecommendedParams,
} from "./shared.types";
import mongoose, { Types } from "mongoose";
import Answer from "../models/answer.model";
import Interaction from "../models/interaction.model";

// get all questions
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    // calculate the number of posts to skip based on the page number and page size
    const skipAmount = (page - 1) * pageSize;

    const query: any = {};
    if (searchQuery) {
      const escapedSearchQuery = searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.$or = [
        { title: { $regex: new RegExp(escapedSearchQuery, "i") } },
        { content: { $regex: new RegExp(escapedSearchQuery, "i") } },
      ];
    }
    let sortOptions = {};
    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);
    const isNext = totalQuestions > skipAmount + questions.length;
    return { questions, isNext };
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
        { $setOnInsert: { name: tag }, $addToSet: { questions: question._id } },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }
    // update the Question database
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    //  Create an interaction record for the user's ask_question action.
    console.log(tagDocuments);
    await Interaction.create({
      user: author,
      action: "ask_question",
      question: question._id,
      tags: tagDocuments,
    });
    // Increment author's reputation by +5 for creating a question.
    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });
    revalidatePath(path);
  } catch (error: any) {
    console.log(error);
    throw new Error(`unbale to create post:${error}`);
  }
}

//  edit a question
export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, title, content, path } = params;

    // create the question
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }
    question.title = title;
    question.content = content;

    await question.save();

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
    const questionObjectId = new Types.ObjectId(questionId);
    const question = Question.findById({ _id: questionObjectId })
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

    // Add Interaction
    !hasupVoted
      ? await Interaction.create({
        user: userId,
        action: "upvote_question",
        question: questionId,
        tags: question.tags,
      })
      : await Interaction.deleteOne({
        question: questionId,
        action: "upvote_question",
      });

    hasdownVoted &&
      (await Interaction.deleteOne({
        question: questionId,
        action: "downvote_question",
      }));

    // add Reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? 4 : hasupVoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(question.author, {
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

    // Add Interaction
    !hasdownVoted
      ? await Interaction.create({
        user: userId,
        action: "downvote_question",
        question: questionId,
        tags: question.tags,
      })
      : await Interaction.deleteOne({
        question: questionId,
        action: "downvote_question",
      });

    hasupVoted &&
      (await Interaction.deleteOne({
        question: questionId,
        action: "upvote_question",
      }));

    // add Reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -4 : hasdownVoted ? 2 : -2 },
    });
    await User.findByIdAndUpdate(question.author, {
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

// Delete a question
export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, path, clerkId } = params;
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question Not Found");
    }
    // add another security layer by checking if the author and the current user is same.
    const user = await User.findOne({ clerkId });
    if (user?._id.toString() !== question.author.toString())
      return console.log("restricted");

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );
    // decrease the reputation of the user by -5
    await User.findByIdAndUpdate(user._id, { $inc: { reputation: -5 } });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get popular questions
export async function getHotQuestions() {
  try {
    connectToDatabase();
    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5);
    return hotQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// Recomended questions
export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    await connectToDatabase();
    const { userId, page = 1, pageSize = 20, searchQuery } = params;

    // find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("user not found");
    }

    const skipAmount = (page - 1) * pageSize;

    // find user's interaction
    const userInteractions = await Interaction.find({
      user: user._id,
    })
      .populate("tags")
      .exec();

    // extract tags from User interaction
    const userTags = userInteractions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags = tags.concat(interaction.tags);
      }
      return tags;
    }, []);

    // Get distinct tag IDs from user's interactions
    const distinctUserTagIds = Array.from(
      new Set(
        userTags
          .map((tag: any) => tag._id)
          .filter((id: any) => id !== undefined)
      )
    );
    console.log("userTags is:", distinctUserTagIds);
    const query: any = {
      $and: [
        { tags: { $in: distinctUserTagIds } }, // questions with user's tags
        { author: { $ne: user._id } }, // Exclude user's own questions
      ],
    };

    if (searchQuery) {
      query.$or = [
        { title: { regex: searchQuery, $options: "i" } },
        { content: { regex: searchQuery, $options: "i" } },
      ];
    }
    const totalQuestions = await Question.countDocuments(query);

    const recommendedQuestions = await Question.find(query)
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .skip(skipAmount)
      .limit(pageSize);

    const isNext = totalQuestions > skipAmount + recommendedQuestions.length;
    return { questions: recommendedQuestions, isNext };
  } catch (error) {
    console.error("Error getting recommended questions:", error);
    throw error;
  }
}

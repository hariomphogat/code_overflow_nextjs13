"use server";

import { FilterQuery } from "mongoose";
import Question from "../models/question.model";
import Tag, { ITag } from "../models/tag.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";

// get top interacted tags
export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();
    const { userId } = params;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    //   find interections for the user and group by tags...
    //  Interactions
    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag3" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get all tags
export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: FilterQuery<typeof Tag> = searchQuery
      ? { name: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    let sortOptions = {};
    switch (filter) {
      case "popular":
        sortOptions = { questions: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;

      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;
    const tags = await Tag.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);
    if (!tags) throw new Error("Tag not found");

    const totalTags = await Tag.countDocuments(query);
    const isNext = totalTags > skipAmount + tags.length;

    return { tags, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// get tag by Id
export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase();
    const { tagId, searchQuery, filter, page = 1, pageSize = 20 } = params;
    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    let sortOptions = {};
    let matchOptions = {};
    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      case "unanswered":
        matchOptions = { answers: { $size: 0 } };
        break;
      // TODO: add functionality for recommended.
      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: {
        ...matchOptions,
        ...(searchQuery
          ? {
              $or: [
                { title: { $regex: new RegExp(searchQuery, "i") } },
                { content: { $regex: new RegExp(searchQuery, "i") } },
              ],
            }
          : {}),
      },
      options: {
        skip: skipAmount,
        limit: pageSize,
        sort: sortOptions,
      },
      populate: [
        {
          path: "author",
          model: User,
          select: "_id clerkId name picture",
        },
        {
          path: "tags",
          model: Tag,
          select: "_id name",
        },
      ],
    });
    if (!tag) throw new Error("Tag not found");

    //  to check if there is a next page
    const nextTag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: {
        ...matchOptions,
        ...(searchQuery
          ? {
              $or: [
                { title: { $regex: new RegExp(searchQuery, "i") } },
                { content: { $regex: new RegExp(searchQuery, "i") } },
              ],
            }
          : {}),
      },
      options: {
        skip: skipAmount + pageSize,
        limit: 1,
        sort: sortOptions,
      },
    });

    const questions = tag.questions;
    const isNext = nextTag.questions.length > 0;

    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// get popular tags
export async function getPopularTags() {
  try {
    await connectToDatabase();
    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);
    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

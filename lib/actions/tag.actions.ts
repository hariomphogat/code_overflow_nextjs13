"use server";

import Tag from "../models/tag.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";

// get top interacted tags
export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();
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
    connectToDatabase();
    const tags = await Tag.find({});
    if (!tags) throw new Error("Tag not found");
    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

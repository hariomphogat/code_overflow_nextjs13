"use server";

import { Types } from "mongoose";
import Interaction from "../models/interaction.model";
import Question from "../models/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    await connectToDatabase();

    const { questionId, userId } = params;

    // Convert questionId to ObjectId if it's not already
    const questionObjectId = new Types.ObjectId(questionId);

    // Update view count for the question
    await Question.findByIdAndUpdate(questionObjectId, { $inc: { views: 1 } });

    if (userId) {
      const existinginteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId,
      });

      if (existinginteraction) return;

      // create Interaction
      await Interaction.create({
        user: userId,
        action: "view",
        question: questionObjectId,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

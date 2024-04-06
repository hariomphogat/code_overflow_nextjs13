"use server";

import Answer from "../models/answer.model";
import Question from "../models/question.model";
import Tag from "../models/tag.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";

const SearchableTypes = ["question", "answer", "user", "tag"];
export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();
    const { query, type } = params;
    const regexQuery = { $regex: query, $options: "i" };
    let results: any = [];
    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];
    const typeLower = type?.toLowerCase();
    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      //  search across everything

      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResult = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

        results.push(
          ...queryResult.map((item) => ({
            title:
              type === "answer"
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id:
              type === "user"
                ? item.clerkId
                : type === "answer"
                ? item.question
                : item._id,
          }))
        );
      }
    } else {
      // search in the specified model type.
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);
      if (!modelInfo) {
        throw new Error("invalid search type");
      }
      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((item) => ({
        title:
          typeLower === "answer"
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type,
        id:
          type === "user"
            ? item.clerk
            : type === "answer"
            ? item.question
            : item._id,
      }));
    }
    return JSON.stringify(results);
  } catch (error) {
    console.log("Error fetching global results", error);
    throw error;
  }
}

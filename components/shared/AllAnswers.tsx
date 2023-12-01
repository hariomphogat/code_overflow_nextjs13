import React from "react";
import Filter from "./Filter";
import { AnswerFilters } from "@/constants/filters";
import { getAnswers } from "@/lib/actions/answer.action";
import Link from "next/link";
import Image from "next/image";
import { getTimeStamp } from "@/lib/utils";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";
interface Props {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: number;
}
const AllAnswers = async ({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: Props) => {
  const result = await getAnswers({ questionId });

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div>
        {(await result.answers).map((answer) => (
          <article key={answer._id} className="light-border border-b py-10">
            {/* TODO: add span id */}
            <div className="flex items-center justify-between">
              <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    width={18}
                    height={18}
                    alt="profile"
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700">
                      {answer.author.name}
                    </p>
                  </div>
                  <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                    <span className="mx-sm:hidden"> - </span>answered{" "}
                    {getTimeStamp(answer.createdAt)}
                  </p>
                </Link>
                <div className="flex justify-end">
                  <Votes
                    itemId={JSON.stringify(answer._id)}
                    type="answer"
                    userId={userId}
                    upvotes={answer.upVotes.length}
                    hasUpvoted={answer.upVotes.includes(JSON.parse(userId))}
                    downvotes={answer.downVotes.length}
                    hasDownvoted={answer.downVotes.includes(JSON.parse(userId))}
                  />
                </div>
              </div>
            </div>
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default AllAnswers;

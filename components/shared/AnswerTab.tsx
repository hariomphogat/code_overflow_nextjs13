import { getUserAnswers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import NoResult from "./NoResult";
import AnswerCard from "../cards/AnswerCard";
import Pagination from "./Pagination";

interface Props {
  searchParams: { [key: string]: string | undefined };
  userId: string;
  clerkId?: string;
}

const AnswerTab = async ({ userId, clerkId, searchParams }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 10,
  });
  if (result.answers.length < 1)
    return (
      <NoResult
        title="No Answers Found"
        description="User hasn't answered any question yet."
        linkTitle="Answer Questions"
        link="/"
      />
    );
  return (
    <>
      {result.answers.map((answer) => (
        <AnswerCard
          key={answer.question._id}
          clerkId={clerkId}
          _id={answer.question._id}
          answerId={answer._id}
          title={answer.question.title}
          answer={answer.content}
          author={answer.author}
          upvotes={answer.upVotes}
          createdAt={answer.createdAt}
        />
      ))}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  );
};

export default AnswerTab;

import { getUserAnswers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import NoResult from "./NoResult";
import AnswerCard from "../cards/AnswerCard";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string;
}

const AnswerTab = async ({ userId, clerkId }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: 1,
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
          title={answer.question.title}
          answer={answer.content}
          author={answer.author}
          upvotes={answer.upVotes}
          createdAt={answer.createdAt}
        />
      ))}
    </>
  );
};

export default AnswerTab;

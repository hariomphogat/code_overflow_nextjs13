import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { URLProps } from "@/types";
import { auth } from "@clerk/nextjs";
import React from "react";

const page = async ({ params }: URLProps) => {
  const { userId } = auth();
  if (!userId) return null;

  const questionId = params.id;

  const mongoUser = await getUserById({ clerkId: userId });
  const question = await getQuestionById({
    questionId: JSON.stringify(questionId),
  });
  if (!question) {
    console.log("question not found");
    return;
  }
  const author = JSON.stringify(question.author.id);
  const currentUser = JSON.stringify(mongoUser._id);
  if (author !== currentUser) return null;
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
        <Question
          type="edit"
          mongoUserId={JSON.stringify(mongoUser._id)}
          questionDetails={JSON.stringify(question)}
        />
      </div>
    </>
  );
};

export default page;

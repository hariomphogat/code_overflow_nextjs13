import Answer from "@/components/forms/Answer";
import AllAnswers from "@/components/shared/AllAnswers";
import Metric from "@/components/shared/Metric";
import NoResult from "@/components/shared/NoResult";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RenderTag";
import Votes from "@/components/shared/Votes";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";

import { auth, currentUser } from "@clerk/nextjs/server";
import { isValidObjectId } from "mongoose";
import Image from "next/image";
import Link from "next/link";
import { createUser } from "@/lib/actions/user.action";

export const dynamic = "force-dynamic";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<any>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  if (!isValidObjectId(params.id))
    return (
      <NoResult
        title="No Question Found"
        description="No Question found to your query"
        link="/"
        linkTitle="Back to Questions"
      />
    );

  const { userId } = await auth();

  let mongoUser;

  if (userId) {
    mongoUser = await getUserById({ clerkId: userId });

    // Sync User if missing from DB
    if (!mongoUser) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        mongoUser = await createUser({
          clerkId: userId,
          name: `${clerkUser.firstName} ${clerkUser.lastName || ""}`,
          username: clerkUser.username || `user_${clerkUser.id.substring(0, 5)}`,
          email: clerkUser.emailAddresses[0].emailAddress,
          picture: clerkUser.imageUrl,
        });
      }
    }
  }

  const question = await getQuestionById({
    questionId: params.id,
  });

  if (!question)
    return (
      <NoResult
        title="No Question Found"
        description="No Question found to your query"
        link="/"
        linkTitle="Back to Questions"
      />
    );

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${question.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={question.author.picture}
              height={22}
              width={22}
              alt="profile"
              className="rounded-full"
            />
            <p className="paragraph-semibold text-dark300_light700">
              {question.author.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Votes
              itemId={JSON.stringify(question._id)}
              type="question"
              userId={JSON.stringify(mongoUser?._id)}
              upvotes={question.upVotes.length}
              hasUpvoted={question.upVotes.includes(mongoUser?._id)}
              downvotes={question.downVotes.length}
              hasDownvoted={question.downVotes.includes(mongoUser?._id)}
              hasSaved={mongoUser?.saved.includes(question._id)}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {question.title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={`asked ${getTimeStamp(question.createdAt)} `}
          title=""
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="Message"
          value={formatNumber(question.answers.length)}
          title="Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="Eye"
          value={formatNumber(question.views)}
          title="Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>
      <ParseHTML data={question.content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {question.tags.map((tag: any) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
          />
        ))}
      </div>

      <AllAnswers
        questionId={question._id}
        userId={JSON.stringify(mongoUser?._id)}
        totalAnswers={question.answers.length}
        page={searchParams.page}
        filter={searchParams?.filter}
      />

      <Answer
        question={question.content}
        questionId={JSON.stringify(question._id)}
        userId={JSON.stringify(mongoUser?._id)}
      />
    </>
  );
}

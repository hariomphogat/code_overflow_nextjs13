import { getUserQuestions } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import QuestionCard from "../cards/QuestionCard";
import NoResult from "./NoResult";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string;
}

const QuestionTab = async ({ userId, clerkId, searchParams }: Props) => {
  const result = await getUserQuestions({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 10,
  });
  if (result.questions.length < 1)
    return (
      <NoResult
        title="No Posts Found"
        description="User hasn't posted any question yet."
        linkTitle="Ask a Question"
        link="/ask-question"
      />
    );
  return (
    <>
      {result.questions.map((question) => (
        <QuestionCard
          key={question._id}
          clerkId={clerkId}
          _id={question._id}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upVotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
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

export default QuestionTab;

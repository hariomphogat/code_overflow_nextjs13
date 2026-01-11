import Filter from "@/components/shared/Filter";
import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { QuestionFilters } from "@/constants/filters";
import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";
import { getSavedQuestions, getUserById, createUser } from "@/lib/actions/user.action";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collection | CodeOverflow",
  description:
    "Welcome to the Collection page of CodeOverflow . A collection of 1,000,000,000+ questions. Join us now.",
};

export default async function Collection(props: SearchParamsProps) {
  const searchParams = await props.searchParams;
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  // Ensure user exists in MongoDB
  let mongoUser = await getUserById({ clerkId: userId });
  if (!mongoUser) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.length > 0
        ? clerkUser.emailAddresses[0].emailAddress
        : `${clerkUser.id}@placeholder.local`;
      mongoUser = await createUser({
        clerkId: userId,
        name: `${clerkUser.firstName} ${clerkUser.lastName || ""}`,
        username: clerkUser.username || `user_${clerkUser.id.substring(0, 5)}`,
        email,
        picture: clerkUser.imageUrl,
      });
    }
  }

  const result = await getSavedQuestions({
    clerkId: userId,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 20,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <div className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/collection"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result?.questions?.length > 0 ? (
          result.questions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upVotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no saved question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
           discussion. our query could be the next big thing others learn from. Get
           involved! 💡"
            link="/ask-a-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  );
}

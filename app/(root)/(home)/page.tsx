import Filter from "@/components/shared/Filter";
import HomeFilters from "@/components/home/HomeFilters";
import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import Link from "next/link";
import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";

const questions: any = [
  {
    id: 1,
    title:
      "Best practices for data fetching in a Next.js application with Server-Side Rendering (SSR)?",
    tags: [{ id: 1, name: "Next.js" }],
    author: {
      _id: 1,
      name: "Hariom Phogat",
      picture: "",
    },
    upvotes: 1234500,
    views: 70904567,
    answers: [],
    createdAt: new Date("2023-10-01T12:00:00.000Z"),
  },
  {
    id: 2,
    title: "How to center a div?",
    tags: [
      { id: 1, name: "CSS" },
      { id: 2, name: "Tailwind CSS" },
    ],
    author: {
      _id: 2,
      name: "Yashwant Phogat",
      picture: "",
    },
    upvotes: 999,
    views: 23152356,
    answers: [],
    createdAt: new Date("2023-10-01T12:00:00.000Z"),
  },
];

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask A Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>
      <HomeFilters />
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question: any) => (
            <QuestionCard
              key={question.id}
              _id={question.id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
           discussion. our query could be the next big thing others learn from. Get
           involved! 💡"
            link="/ask-a-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}

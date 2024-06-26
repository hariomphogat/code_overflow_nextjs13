import React from "react";
import Image from "next/image";
import Link from "next/link";
import RenderTag from "../RenderTag";
import { getHotQuestions } from "@/lib/actions/question.action";
import { getPopularTags } from "@/lib/actions/tag.actions";

const RightSidebar = async () => {
  const hotQuestions = await getHotQuestions();
  const popularTags = await getPopularTags();
  return (
    <section
      className="background-light900_dark200 light-border
    custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px]
     flex-col justify-between overflow-y-auto border-l p-6 pt-36
      shadow-light-300 dark:shadow-none max-xl:hidden "
    >
      {/* Top Questions */}
      <div className="flex flex-col gap-6">
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map((qs) => {
            return (
              <Link
                href={`/question/${qs._id}`}
                className="flex cursor-pointer flex-row items-center justify-between gap-7"
                key={qs._id}
              >
                <p className="body-medium text-dark500_light700 line-clamp-2">
                  {qs.title}
                </p>
                <Image
                  src="assets/icons/chevron-right.svg"
                  alt="chevron right"
                  width={20}
                  height={20}
                  className="invert-colors"
                />
              </Link>
            );
          })}
        </div>
      </div>
      {/* popular tags */}
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex w-full flex-col gap-4">
          {popularTags.map((tag: any) => {
            return (
              <RenderTag
                key={tag._id}
                _id={tag._id}
                name={tag.name}
                totalQuestions={tag.numberOfQuestions}
                showCount
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;

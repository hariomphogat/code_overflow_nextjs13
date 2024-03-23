import { Skeleton } from "@/components/ui/skeleton";

import React from "react";

const Loading = () => {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Tags</h1>
      <div className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <Skeleton className="h-14 flex-1" />
        <div className="min-h-[56px] sm:min-w-[170px]">
          <Skeleton className="h-14 w-28" />
        </div>
      </div>
      <section className="mt-12 flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div
            key={item}
            className="shadow-light100_darknone w-full sm:w-[260px]"
          >
            <div className="background-light900_dark200 light-border flex flex-col rounded-2xl border px-8 py-10">
              <div className="w-fit rounded-sm ">
                <Skeleton className="h-10 w-20" />
              </div>
              <div className="flex flex-row gap-2 ">
                <Skeleton className="mt-3.5 h-4 w-6" />
                <Skeleton className="mt-3.5 h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default Loading;

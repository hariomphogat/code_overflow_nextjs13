import { Skeleton } from "@/components/ui/skeleton";

import React from "react";

const Loading = () => {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <div className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <div className="flex-1">
          <Skeleton className="h-14 flex-1" />
        </div>
        <div className="max-w-[170px]">
          <Skeleton className="flex min-h-[56px] sm:min-w-[170px]" />
        </div>
      </div>
      <section className="mt-12 flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton
            key={item}
            className=" h-64 w-full max-xs:min-w-full xs:w-[260px]"
          />
        ))}
      </section>
    </>
  );
};

export default Loading;

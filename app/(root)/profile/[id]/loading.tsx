import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <>
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row ">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="mt-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-6 w-28" />
            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="mt-8" />
          </div>
        </div>
        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          <Skeleton className="h-12 w-44" />
        </div>
      </div>

      <div className="mt-10 flex gap-10">
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="mt-6 flex flex-row flex-wrap gap-6">
        <Skeleton className="h-36 w-40 rounded-md" />
        <Skeleton className="h-36 w-40 rounded-md" />
        <Skeleton className="h-36 w-40 rounded-md" />
        <Skeleton className="h-36 w-40 rounded-md" />
      </div>

      <div className="mt-10">
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </>
  );
};

export default Loading;

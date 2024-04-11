import LocationFilter from "@/components/shared/LocationFilter";
import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { AllCountriesFilters } from "@/constants/filters";
import React from "react";

const Loading = () => {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">Jobs</h1>
      </div>
      <div className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/jobs"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Job Title, Company, or Keywords"
          otherClasses="flex-1"
        />
        <LocationFilter
          filters={AllCountriesFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="min-w-fit"
        />
      </div>
      <div className="mt-10 flex flex-col gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Skeleton key={item} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </>
  );
};

export default Loading;

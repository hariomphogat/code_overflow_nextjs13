/* eslint-disable camelcase */
import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { AllCountriesFilters } from "@/constants/filters";
import NoResult from "@/components/shared/NoResult";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";
import type { Metadata } from "next";
import JobCard from "@/components/cards/JobCard";
import LocationFilter from "@/components/shared/LocationFilter";
// import GetJobs from "@/app/api/findjobs/route";

export const metadata: Metadata = {
  title: "Jobs | CodeOverflow",
  description:
    "Welcome to the Jobs page of CodeOverflow where you can find jobs.",
};

export default async function Jobs({ searchParams }: SearchParamsProps) {
  // fetch client Country
  const ipApiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/country` || "";
  const clientData = await fetch(ipApiUrl, { method: "GET" }).then((res) => {
    return res.json();
  });
  const clientCountry = await clientData?.clientCountryData?.country;

  const location = searchParams?.location;
  const page = searchParams?.page || "1";
  const job_titles = searchParams?.q;

  const jobsLocation = location || clientCountry || "india";

  let jobsApiUrl;
  // fetch jobs data
  if (job_titles) {
    jobsApiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/findjobs?location=${encodeURIComponent(jobsLocation)}&page=${page}&job_titles=${encodeURIComponent(job_titles)}`;
  } else {
    jobsApiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/findjobs?location=${encodeURIComponent(jobsLocation)}&page=${page}`;
  }
  const response = await fetch(jobsApiUrl);
  const result = await response.json();
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
      <div className="mt-10 flex w-full flex-col gap-6">
        {result.length > 0 ? (
          result.map((job: any) => (
            <JobCard
              key={job.job_id}
              title={job.job_title}
              description={job.job_description}
              employer_logo={job.employer_logo}
              employment_type={job.job_employment_type}
              job_link={job.job_apply_link}
              salary={job.job_min_salary || "Not disclosed"}
              job_city={job.job_city}
              job_state={job.job_state}
              job_country={job.job_country}
            />
          ))
        ) : (
          <NoResult
            title="No Jobs Available"
            description="Don't let the absence of opportunities hold you back! 🌟 Be the pioneer in sparking new discussions. Your inquiry might ignite the next big idea others can learn from. Get engaged and pave the way for innovation! 💼"
          />
        )}
      </div>
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1}
          isNext={result.length > 9}
        />
      </div>
    </>
  );
}

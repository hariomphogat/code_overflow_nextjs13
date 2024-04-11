/* eslint-disable camelcase */
import Link from "next/link";
import Metric from "../shared/Metric";
import { Badge } from "../ui/badge";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { fullLocationName } from "@/lib/utils";

interface JobsProps {
  job_id?: string;
  title: string;
  description: string;
  employer_logo?: string;
  employment_type: string;
  job_link: string;
  salary: string;
  job_city: string;
  job_state: string;
  job_country: string;
}

const JobCard = ({
  job_id,
  title,
  description,
  employer_logo,
  employment_type,
  job_link,
  salary,
  job_city,
  job_state,
  job_country,
}: JobsProps) => {
  const locationName = fullLocationName({
    city: String(job_city),
    state: String(job_state),
    country: String(job_country),
  });
  return (
    <div className="card-wrapper mt-4 rounded-[10px] p-9 sm:px-11">
      <span className="subtle-regular text-dark400_light700 mb-2 line-clamp-1 flex justify-end sm:hidden">
        <Badge className=" background-light800_dark300 body-medium text-dark400_light700 inline-flex items-center gap-2 rounded-xl border-none px-4 py-2 ">
          <Image
            src={`https://flagcdn.com/w320/${job_country.toLowerCase()}.png`}
            alt="employer logo"
            height={16}
            width={16}
            className="rounded-sm"
          />
          {locationName}
        </Badge>
      </span>
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <div className="flex min-w-fit">
          <Image
            src={employer_logo || "/assets/images/site-logo.svg"}
            alt="employer logo"
            height={64}
            width={64}
            className="rounded object-contain"
          />
        </div>
        <div className="flex">
          <div className="flex flex-row flex-wrap justify-between gap-3">
            <div className="flex items-start">
              <h3 className="text-dark200_light900 sm:h3-semibold base-semibold line-clamp-2 w-full flex-1">
                {title}
              </h3>
            </div>
            <Badge className=" background-light800_dark300 body-medium text-dark400_light700 inline-flex items-center gap-2 rounded-xl border-none px-4 py-2  max-sm:hidden">
              <Image
                src={`https://flagcdn.com/w320/${job_country.toLowerCase()}.png`}
                alt="employer logo"
                height={16}
                width={16}
                className="rounded-sm"
              />
              {locationName}
            </Badge>
            <p className="text-dark200_light900 body-medium line-clamp-2 text-wrap">
              {description}
            </p>

            <div className="flex-between mt-6 w-full flex-wrap gap-3 ">
              <div className="flex gap-3">
                <Metric
                  imgUrl="/assets/icons/clock-2.svg"
                  alt="time"
                  value={employment_type.toUpperCase()}
                  title=""
                  textStyles="body-medium text-light-500"
                />
                <Metric
                  imgUrl="/assets/icons/currency-dollar-circle.svg"
                  alt="salary"
                  value={salary}
                  title=""
                  textStyles="body-medium text-light-500"
                />
              </div>
              <Link href={job_link}>
                <div className="body-regular flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
                  <p className="text-primary-500">ViewJob</p>
                  <ArrowTopRightIcon
                    height={20}
                    width={20}
                    className="text-primary-500"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

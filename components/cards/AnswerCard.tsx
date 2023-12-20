import Link from "next/link";
import Metric from "../shared/Metric";
import { formatNumber, getTimeStamp } from "@/lib/utils";

interface AnswerProps {
  clerkId?: string;
  _id: string;
  title: string;
  answer: string;
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  upvotes: Array<object>;
  createdAt: Date;
}

const AnswerCard = ({
  clerkId,
  _id,
  title,
  answer,
  author,
  upvotes,
  createdAt,
}: AnswerProps) => {
  const postTime = getTimeStamp(createdAt);

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div className="flex flex-col">
          <div>
            <Link href={`/question/${_id.toString()}`}>
              <h3 className="text-dark200_light900 sm:h3-semibold base-semibold line-clamp-1 flex-1">
                {title}
              </h3>
            </Link>
          </div>
          <div className="ml-2 min-h-[1rem] w-0 border border-r-2 border-gray-300 opacity-60 dark:border-gray-700"></div>
          <div className="mt-1 rounded-lg bg-slate-200 px-4 py-2 outline-none  dark:bg-slate-800">
            <Link href={`/question/${_id.toString()}`}>
              <h3 className="text-dark200_light900 sm:paragraph-semibold paragraph-semibold line-clamp-1 flex-1">
                {answer}
              </h3>
            </Link>
          </div>
        </div>

        {/* if the creater has signed in then show the edit/delete button */}
      </div>
      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <div>
          <Metric
            imgUrl={author.picture}
            alt="User"
            value={author.name}
            title={`• answered ${postTime}`}
            href={`/profile/${author.clerkId.toString()}`}
            isAuthor
            textStyles="body-medium text-dark400_light700"
          />
        </div>
        <div className="flex w-1/2 min-w-fit flex-row justify-end gap-3">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="Upvotes"
            value={formatNumber(upvotes?.length)}
            title="Votes"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;

import Link from "next/link";
import Metric from "../shared/Metric";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";
import EditDeleteAction from "../shared/EditDeleteAction";

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
  const showActionButtons = clerkId && clerkId === author.clerkId;
  const postTime = getTimeStamp(createdAt);

  function extractJavaScriptCode(input: string) {
    const javascriptCodeRegex = /<code>([\s\S]+?)<\/code>/i;
    const match = input.match(javascriptCodeRegex);

    if (match) {
      const rawJavaScriptCode = match[1].replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove HTML tags and trim
      return rawJavaScriptCode.slice(0, 70);
    } else {
      return input.slice(0, 70); // Convert non-matching input to string
    }
  }

  return (
    <div className="card-wrapper mt-4 rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <Link href={`/question/${_id.toString()}`}>
          <h3 className="text-dark200_light900 h3-semibold line-clamp-1 flex-1">
            {title}
          </h3>
        </Link>
        {/* if the creater has signed in then show the delete button */}
        <SignedIn>
          {showActionButtons && (
            <EditDeleteAction type="answer" itemId={JSON.stringify(_id)} />
          )}
        </SignedIn>
      </div>
      <div className="ml-2 min-h-[1rem] w-0 border border-l-2 border-gray-300 opacity-60 dark:border-gray-700"></div>
      <div className="mt-1  rounded-lg bg-slate-200 px-4 py-2 outline-none dark:bg-slate-800">
        <Link href={`/question/${_id.toString()}`}>
          <h3 className="text-dark200_light900 paragraph-semibold line-clamp-1 flex-1">
            {extractJavaScriptCode(answer)}
          </h3>
        </Link>
      </div>
      <span className="subtle-regular text-dark400_light700 line-clamp-1 flex justify-end sm:hidden">
        {`• answered ${postTime}`}
      </span>
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
        <div className="flex min-w-fit flex-row justify-end gap-3">
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

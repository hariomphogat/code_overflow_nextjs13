"use client";

import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.action";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";

interface Props {
  type: "question" | "answer";
  itemId: string;
  clerkId?: string;
}
const EditDeleteAction = ({ type, itemId, clerkId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleEdit = async () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };
  const handleDelete = async () => {
    try {
      if (type === "question") {
        // delte question
        await deleteQuestion({
          questionId: JSON.parse(itemId),
          path: pathname,
          clerkId,
        });
      } else if (type === "answer") {
        // delete answer
        await deleteAnswer({
          answerId: JSON.parse(itemId),
          path: pathname,
          clerkId,
        });
      }
      toast({
        title: `${
          type === "question" ? "Question" : "Answer"
        } deleted Successfully`,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: `Error occurred while deleting the ${
          type === "question" ? "question" : "answer"
        }`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-3 max-sm:w-full max-sm:self-end sm:min-w-[6rem]">
        {type === "question" && (
          <Image
            src="/assets/icons/edit.svg"
            alt="Edit"
            height={14}
            width={14}
            className="cursor-pointer object-contain"
            onClick={handleEdit}
          />
        )}
        <Image
          src="/assets/icons/trash.svg"
          alt="Delete"
          height={14}
          width={14}
          className="cursor-pointer object-contain"
          onClick={handleDelete}
        />
      </div>
    </>
  );
};

export default EditDeleteAction;

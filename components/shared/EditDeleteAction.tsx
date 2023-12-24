"use client";

import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.action";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  type: "question" | "answer";
  itemId: string;
}
const EditDeleteAction = ({ type, itemId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleEdit = async () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };
  const handleDelete = async () => {
    if (type === "question") {
      // delte question
      await deleteQuestion({ questionId: JSON.parse(itemId), path: pathname });
    } else if (type === "answer") {
      // delete answer
      await deleteAnswer({ answerId: JSON.parse(itemId), path: pathname });
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

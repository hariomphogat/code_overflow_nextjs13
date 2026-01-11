import Question from "@/components/forms/Question";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ask Question | CodeOverflow",
  description:
    "Welcome to the Ask Question page of CodeOverflow . CodeOverflow is community of 100,000,000+ developers. Ask a question now.",
};

const page = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");
  const mongoUser = await getUserById({ clerkId: userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask Question</h1>
      <div className="mt-9">
        <Question mongoUserId={JSON.parse(JSON.stringify(mongoUser._id))} />
      </div>
    </div>
  );
};

export default page;

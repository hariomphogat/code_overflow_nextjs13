import EditProfile from "@/components/forms/EditProfile";
import { getUserById } from "@/lib/actions/user.action";
import { URLProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import React from "react";

export const dynamic = "force-dynamic";

const page = async (props: URLProps) => {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return;
  const mongoUser = await getUserById({ clerkId: userId });
  if (!mongoUser) return;
  if (userId !== mongoUser.clerkId) return null;
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 ">Edit Profile</h1>
      <div className="mt-9">
        <EditProfile
          clerkId={userId}
          name={mongoUser.name}
          username={mongoUser.username}
          portfolioWebsite={mongoUser.portfolioWebsite}
          location={mongoUser.location}
          bio={mongoUser.bio}
        />
      </div>
    </>
  );
};

export default page;

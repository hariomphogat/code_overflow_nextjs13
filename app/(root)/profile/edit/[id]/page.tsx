import EditProfile from "@/components/forms/EditProfile";
import { getUserById } from "@/lib/actions/user.action";
import { URLProps } from "@/types";
import { auth } from "@clerk/nextjs";
import React from "react";

const page = async ({ params }: URLProps) => {
  const { userId } = auth();
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

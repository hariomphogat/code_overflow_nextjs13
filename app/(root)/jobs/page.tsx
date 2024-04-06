import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <Image
        src="/assets/images/under-maintainance.svg"
        alt="No result illustration"
        width={270}
        height={200}
        className="block object-contain"
      />
      <h2 className="h2-bold text-dark200_light900 mt-8 ">Coming Soon...</h2>
    </div>
  );
};

export default page;

import LeftSidebar from "@/components/shared/Sidebars/LeftSidebar";
import RightSidebar from "@/components/shared/Sidebars/RightSidebar";
import Navbar from "@/components/shared/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const year = new Date().getFullYear();
  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
          <footer>
            <p className="small-regular mt-2 items-center justify-end p-1 text-center align-bottom text-gray-400 dark:text-gray-500">
              &copy; {` Hariom Phogat ${year}`}
            </p>
          </footer>
        </section>
        <RightSidebar />
      </div>
      <Toaster />
    </main>
  );
};

export default Layout;

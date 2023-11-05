"use client";
import React from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";

const NavContent = () => {
  const pathname = usePathname();

  return (
    <section className="flex h-full flex-col gap-3 py-10">
      {sidebarLinks.map((item) => {
        const isActive =
          (pathname.includes(item.route) && item.route.length > 1) ||
          pathname === item.route;
        return (
          <SheetClose asChild key={item.route}>
            <Link
              key={item.route}
              href={item.route}
              className={`${
                isActive
                  ? "primary-gradient rounded-lg text-light-900"
                  : "text-dark300_light900"
              } flex items-center justify-start gap-4 bg-transparent p-4`}
            >
              <Image
                key={item.imgURL}
                src={item.imgURL}
                alt={item.label}
                height={20}
                width={20}
                className={`${isActive ? "" : "invert-colors"}`}
              />
              <p
                key={item.label}
                className={`${isActive ? "base-bold" : "base-medium"}`}
              >
                {item.label}
              </p>
            </Link>
          </SheetClose>
        );
      })}
    </section>
  );
};
const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/assets/icons/hamburger.svg"
          alt="Menu"
          height={36}
          width={36}
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none"
      >
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/assets/images/site-logo.svg"
            width={23}
            height={23}
            alt="Devflow"
          />
          <p className="h2-bold text-dark100_light900 font-spaceGrotesk ">
            Code<span className="text-primary-500">Overflow</span>
          </p>
        </Link>
        <div>
          <SheetClose asChild>
            <NavContent />
          </SheetClose>
          <SignedOut>
            <div className="bottom-5 flex flex-col gap-3">
              <SheetClose asChild>
                <Link href="/sign-in">
                  <Button className="small-medium btn-secondary text-dark400_light900 min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                    Sign In
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/sign-up">
                  <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                    Sign Up
                  </Button>
                </Link>
              </SheetClose>
            </div>
          </SignedOut>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

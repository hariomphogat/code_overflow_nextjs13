"use client";
import { HomePageFilters } from "@/constants/filters";
import React, { useState } from "react";
import { Button } from "../ui/button";

import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

const HomeFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("filter");

  const [active, setActive] = useState(query || "");

  const handleFilterClick = (filterValue: string) => {
    if (active !== filterValue) {
      setActive(filterValue);
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: filterValue.toLowerCase(),
      });
      router.push(newUrl, { scroll: false });
    } else {
      setActive("");
      const newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["filter"],
      });
      router.push(newUrl, { scroll: false });
    }
  };
  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => {
            handleFilterClick(filter.value);
          }}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${
            active === filter.value
              ? "bg-primary-100 text-primary-500"
              : "bg-light-800 text-light-500"
          }`}
        >
          {filter.value}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;

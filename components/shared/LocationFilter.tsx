"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  filters: {
    name: string;
    value: string;
  }[];
  otherClasses?: string;
  containerClasses?: string;
}
const LocationFilter = ({ filters, otherClasses, containerClasses }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filterParams = searchParams.get("location");

  const handleSelect = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "location",
      value,
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`relative ${containerClasses}`}>
      <Select
        onValueChange={handleSelect}
        defaultValue={filterParams || undefined}
      >
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
        >
          <div className="line-clamp-1 flex-1 flex-col text-left">
            <div className="flex items-start gap-2 pr-4">
              <Image
                src="/assets/icons/carbon-location.svg"
                alt="location"
                width={20}
                height={20}
              />
              <SelectValue placeholder="Select Location" />
            </div>
          </div>
        </SelectTrigger>
        <SelectContent className="text-dark500_light700 small-regular max-h-80 max-w-52 text-wrap border-none bg-light-900 dark:bg-dark-300">
          {filters.map((filter) => {
            return (
              <SelectItem
                key={filter.value}
                value={filter.value}
                className="cursor-pointer focus:bg-light-800 dark:focus:bg-dark-400"
              >
                {filter.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationFilter;

import { type ClassValue, clsx } from "clsx";
import { parse } from "parse5";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// calculate the timestamp
export const getTimeStamp = (createdAt: Date): string => {
  const now = new Date();
  const timePast = now.getTime() - createdAt.getTime();

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30.44 * day; // Average number of days in a month
  const year = 365.25 * day; // Average number of days in a year

  if (timePast < minute) {
    return `${Math.floor(timePast / second)} seconds ago`;
  }
  if (timePast < hour) {
    return `${Math.floor(timePast / minute)} minutes ago`;
  }
  if (timePast < day) {
    return `${Math.floor(timePast / hour)} hours ago`;
  }
  if (timePast < week) {
    return `${Math.floor(timePast / day)} day${timePast > day ? "s" : ""} ago`;
  }
  if (timePast < month) {
    return `${Math.floor(timePast / week)} week${
      timePast > week ? "s" : ""
    } ago`;
  }
  if (timePast < year) {
    return `${Math.floor(timePast / month)} month${
      timePast > month ? "s" : ""
    } ago`;
  }
  return `${Math.floor(timePast / year)} year${timePast > year ? "s" : ""} ago`;
};

// formats a big number
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num?.toString();
};

// format join date
export function getJoinDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  const formattedDate: string = new Intl.DateTimeFormat(
    "en-US",
    options
  ).format(date);
  return formattedDate;
}

// extract text from html code
export const extractTextFromHTML = (html: any): string => {
  const javascriptCodeRegex = /<code>([\s\S]+?)<\/code>/i;
  const match = html.match(javascriptCodeRegex);

  if (match) {
    // If the HTML contains <code> block
    const rawJavaScriptCode = match[1].replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove HTML tags and trim
    return rawJavaScriptCode;
  } else {
    // If the HTML does not contain <code> block
    const parsedHTML = parse(html);
    const textContent = getTextContent(parsedHTML);
    return textContent;
  }
};
const getTextContent = (node: any): string => {
  if (node.childNodes) {
    return node.childNodes.map((child: any) => getTextContent(child)).join(" ");
  } else if (node.nodeName === "#text") {
    return node.value.trim();
  }
  return "";
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}
// from new url by removing query
export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params);
  currentUrl[key] = value;
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    {
      skipNull: true,
    }
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}
// from new url using search value
export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params);
  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    {
      skipNull: true,
    }
  );
};

interface BadgeParam {
  criteria: { type: keyof typeof BADGE_CRITERIA; count: number }[];
}
// assign bages
export const assignBadges = (params: BadgeParam) => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };
  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels: any = BADGE_CRITERIA[type];
    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });
  return badgeCounts;
};

// capitalize  a variable
interface LocationProps {
  city?: string;
  state?: string;
  country?: string;
}

export function fullLocationName({ city, state, country }: LocationProps) {
  let locationString = "";

  if (city && city !== "null") {
    locationString += city.charAt(0).toUpperCase() + city.slice(1) + ", ";
  }

  if (state && state !== "null") {
    locationString += state.toUpperCase() + ", ";
  }

  if (country && country !== "null") {
    locationString += country.toUpperCase();
  }

  // Remove trailing comma if present
  if (locationString.endsWith(", ")) {
    locationString = locationString.slice(0, -2);
  }

  return locationString;
}

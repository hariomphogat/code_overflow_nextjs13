import { type ClassValue, clsx } from "clsx";
import { parse } from "parse5";
import { twMerge } from "tailwind-merge";

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

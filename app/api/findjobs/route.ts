/* eslint-disable camelcase */

// import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const queryString = req?.url || "";
  const url = new URL(queryString);
  const params = url.searchParams;
  const location = params.get("location") || "india";
  const page = params.get("page") || "1";
  const query = params.get("job_titles") || "";
  const axios = require("axios");

  // create query
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: `Developer jobs in ${location}`,
      page,
      num_pages: "1",
      job_titles: query,
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  };

  // call Api to fetch jobs based on option query
  try {
    const response = await axios.request(options);
    const data = response.data.data;
    // console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error while fetching the data:", error);
    throw error;
  }
}

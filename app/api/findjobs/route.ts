/* eslint-disable camelcase */

interface Params {
  location?: String;
  page?: String;
  query?: String;
}
export default async function GetJobs({
  location = "India",
  page = "1",
  query = "",
}: Params) {
  const axios = require("axios");

  // create query
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: "Developer jobs in " + location,
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
    return response.data.data;
  } catch (error) {
    console.error("Error while fetching the data:", error);
    throw error;
  }
}

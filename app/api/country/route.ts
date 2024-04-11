import { NextResponse } from "next/server";

interface CountryData {
  country: string;
}

export async function GET(req: Request) {
  try {
    // Fetch client's country using IP API
    const ipApiUrl = "http://ip-api.com/json/?fields=country";
    const response = await fetch(ipApiUrl, { method: "GET" });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error("Failed to fetch client country");
    }

    // Parse the JSON response
    const clientCountryData: CountryData = await response.json();
    return NextResponse.json({ clientCountryData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

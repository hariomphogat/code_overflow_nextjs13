import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  // Early validation
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured. Please add OPENROUTER_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const { question } = await request.json();

  console.log("AI Request - Question:", question?.substring(0, 100));

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}`,
        "X-Title": "CodeOverflow",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_API_MODEL || "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content:
              "As an assistant on our CodeOverflow app, your role is to provide concise, accurate, and easy-to-understand answers to developers questions. Your primary tasks include, Detecting the programming language mentioned in the question, Providing solutions or examples in the detected programming language, Ensuring the answers are concise yet comprehensive, covering all necessary aspects of the problem, Using clear and simple language to aid understanding for developers of all levels. Your answers should aim to assist developers efficiently, helping them solve their problems and understand concepts better. Tailor your response based on the detected programming language and the specifics of the question.",
          },
          {
            role: "user",
            content: `Tell me ${question}`,
          },
        ],
      }),
    });

    const responseData = await response.json();

    console.log("OpenRouter Response Status:", response.status);

    if (!response.ok) {
      console.error("OpenRouter API Error:", JSON.stringify(responseData, null, 2));
      throw new Error(responseData.error?.message || `API Error: ${Number(response.status)}`);
    }

    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      console.error("Invalid OpenRouter Response:", JSON.stringify(responseData, null, 2));
      throw new Error("Invalid response format from AI provider");
    }

    const reply = responseData.choices[0].message.content;
    console.log("AI Response received successfully");

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Generation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

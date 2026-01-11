import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { question } = await request.json();
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": `${process.env.NEXT_PUBLIC_SERVER_URL}`, // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "CodeOverflow", // Optional. Shows in rankings on openrouter.ai.
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
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

    if (!response.ok) {
      console.error("OpenRouter API Error:", responseData);
      throw new Error(responseData.error?.message || "Failed to fetch AI response");
    }

    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      console.error("Invalid OpenRouter Response:", responseData);
      throw new Error("Invalid response format from AI provider");
    }

    const reply = responseData.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

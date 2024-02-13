import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { question } = await request.json();
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
    const reply = responseData.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
};

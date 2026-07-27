import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured. Please set GOOGLE_AI_API_KEY." },
        { status: 500 }
      );
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: `You are an English tutor AI. Help a ${context?.level || "intermediate"} level learner practice English conversation.

RULES:
1. Respond in English, keep sentences simple for ${context?.level || "intermediate"} level
2. Always respond in a friendly, encouraging tone
3. If user makes a mistake, gently correct them after your response
4. Keep responses short (1-3 sentences)
5. Ask follow-up questions to keep conversation going
6. Topic: ${context?.topic || "daily conversation"}

Example:
- Beginner: "Good job! Try: 'My name is [name]'"
- Intermediate: "Nice! Can you tell me more about that?"
- Advanced: "That's grammatically correct. Can you make it more natural?"`,
    });

    const chatHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: chatHistory.slice(0, -1),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const lastMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text || "";
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text() || "Sorry, I didn't catch that. Can you try again?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Tutor error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

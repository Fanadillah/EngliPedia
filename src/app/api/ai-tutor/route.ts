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

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback: smart simulation when no API key
      const lastUserMsg = messages
        .filter((m: { role: string }) => m.role === "user")
        .pop()?.content || "";

      const level = context?.level || "intermediate";
      const topic = context?.topic || "daily conversation";

      const fallbackReplies: Record<string, string[]> = {
        daily: [
          `That's interesting! Tell me more about that.`,
          `Good English! Can you use that in a longer sentence?`,
          `Nice try! Try saying it this way: "${lastUserMsg}" but with more context.`,
          `Great job! Now try answering: "Why do you think so?"`,
        ],
        travel: [
          "Where are you traveling to? Have you been there before?",
          "Do you need help checking in at the airport?",
          "That sounds like a great trip! What will you do there?",
        ],
        food: [
          "What's your favorite food? Can you describe the taste?",
          "Would you like to order something else?",
          "Have you tried Indonesian food? It's delicious!",
        ],
        shopping: [
          "How much does that cost? Do you think it's worth the price?",
          "Would you like to try a different color or size?",
          "Do you need a receipt for that?",
        ],
        work: [
          "Can you describe your job responsibilities?",
          "What skills do you think are important for that role?",
          "That's a great answer for an interview!",
        ],
        interview: [
          "Can you tell me about your work experience?",
          "What are your strengths and weaknesses?",
          "Why do you want to work for this company?",
        ],
      };

      const replies = fallbackReplies[topic] || fallbackReplies.daily;
      const reply = replies[Math.floor(Math.random() * replies.length)];

      return NextResponse.json({ reply });
    }

    // Dynamic import to avoid build-time issues
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const level = context?.level || "intermediate";
    const topic = context?.topic || "daily conversation";

    const systemPrompt = `You are an English tutor AI helping a ${level} level learner practice English conversation.

RULES:
1. Respond in English, but keep sentences simple for ${level} level
2. Always respond in a friendly, encouraging tone
3. If user makes a mistake, gently correct them after your response
4. Keep responses short (1-3 sentences for practice)
5. Ask follow-up questions to keep conversation going
6. Topic: ${topic}

Example responses:
- Beginner: "Good job! Try: 'My name is [name]'"  
- Intermediate: "Nice! Can you tell me more about that?"
- Advanced: "That's grammatically correct. Can you make it more natural?"`;

    // Convert to Gemini format
    const chatHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Start chat with system instruction
    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // Exclude last user message
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(
      `${systemPrompt}\n\nUser: ${chatHistory[chatHistory.length - 1]?.parts[0]?.text || ""}`
    );
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

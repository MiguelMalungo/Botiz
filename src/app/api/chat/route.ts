import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// API keys are stored securely in environment variables
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface ChatRequest {
  widgetId: string;
  message: string;
  sessionId: string;
  // Widget configuration passed from the embed
  config: {
    provider: "openai" | "anthropic";
    model: string;
    systemPrompt: string;
    businessContext: string;
    restrictToBusinessTopics: boolean;
    contextSources: Array<{
      type: "website" | "pdf";
      name: string;
      content?: string;
    }>;
    brandingName: string;
  };
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

function buildSystemPrompt(config: ChatRequest["config"]): string {
  let systemPrompt = "";

  // Base instructions
  if (config.systemPrompt) {
    systemPrompt += config.systemPrompt + "\n\n";
  }

  // Business context
  if (config.businessContext) {
    systemPrompt += `## About the Business\n${config.businessContext}\n\n`;
  }

  // Context sources
  if (config.contextSources && config.contextSources.length > 0) {
    systemPrompt += "## Reference Information\nUse the following sources to answer questions:\n\n";
    for (const source of config.contextSources) {
      if (source.content) {
        systemPrompt += `### ${source.name} (${source.type})\n${source.content}\n\n`;
      }
    }
  }

  // Business topic restriction
  if (config.restrictToBusinessTopics) {
    systemPrompt += `## Response Guidelines
- You are a helpful assistant for ${config.brandingName || "this business"}.
- Only answer questions that are relevant to the business, its products, services, or the information provided in the reference materials.
- If a user asks about something unrelated to the business or tries to use you for general purposes, politely redirect them. Say something like: "I'm here to help you with questions about ${config.brandingName || "our business"}. Is there something specific about our products or services I can help you with?"
- Be friendly, professional, and concise.
- If you don't have information to answer a question about the business, say so honestly and suggest they contact the business directly.
`;
  } else {
    systemPrompt += `## Response Guidelines
- You are a helpful assistant for ${config.brandingName || "this business"}.
- Be friendly, professional, and concise.
- Prioritize information from the reference materials when answering questions about the business.
`;
  }

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, config, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(config);

    // Use OpenAI
    if (config.provider === "openai") {
      if (!openai) {
        return NextResponse.json(
          { error: "OpenAI API key not configured on the server" },
          { status: 500 }
        );
      }

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      const response = await openai.chat.completions.create({
        model: config.model || "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const botResponse = response.choices[0]?.message?.content || "No response";
      return NextResponse.json({ response: botResponse });
    }

    // Use Anthropic
    if (config.provider === "anthropic") {
      if (!anthropic) {
        return NextResponse.json(
          { error: "Anthropic API key not configured on the server" },
          { status: 500 }
        );
      }

      const messages: Anthropic.MessageParam[] = [
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      const response = await anthropic.messages.create({
        model: config.model || "claude-3-haiku-20240307",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      });

      const botResponse =
        response.content[0]?.type === "text"
          ? response.content[0].text
          : "No response";
      return NextResponse.json({ response: botResponse });
    }

    return NextResponse.json(
      { error: "Invalid AI provider" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCopilotResponse } from "@/lib/copilot/engine";

export const dynamic = "force-dynamic";

const ChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(12)
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = ChatSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 422 }
      );
    }

    const { message, history } = parsed.data;
    const response = await generateCopilotResponse(message, history || []);

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (err: any) {
    console.error("[CopilotRoute] Error processing copilot chat:", err);
    return NextResponse.json(
      { error: "Internal server error occurred while processing assistant request" },
      { status: 500 }
    );
  }
}

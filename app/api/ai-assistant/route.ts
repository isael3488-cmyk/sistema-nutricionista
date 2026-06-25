import { NextResponse } from "next/server";
import {
  buildNutritionAssistantPrompt,
  createFallbackResult,
  nutritionAssistantModel,
  nutritionAssistantResponseSchema,
  type NutritionAssistantApiResponse,
  type NutritionAssistantInput,
} from "@/lib/ai/nutrition-assistant";

type OpenAIResponsePayload = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  error?: { message?: string };
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: NutritionAssistantInput;

  try {
    body = (await request.json()) as NutritionAssistantInput;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisicao invalido." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!body?.patient?.name) {
    return NextResponse.json(
      { error: "Dados do paciente sao obrigatorios." },
      { status: 400 },
    );
  }

  if (!apiKey) {
    return NextResponse.json({ result: createFallbackResult(body) });
  }

  const prompt = buildNutritionAssistantPrompt(body);

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: nutritionAssistantModel,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "Voce auxilia nutricionistas com sugestoes seguras, prudentes e para revisao profissional.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "nutrition_assistant_output",
            strict: true,
            schema: nutritionAssistantResponseSchema,
          },
        },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel conectar na API da OpenAI." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | OpenAIResponsePayload
      | null;

    const message =
      errorPayload?.error?.message ?? "Falha ao gerar sugestao com a OpenAI.";
    return NextResponse.json(
      { error: message, result: createFallbackResult(body) },
      { status: response.status },
    );
  }

  const data = (await response.json()) as OpenAIResponsePayload;
  const outputText = extractOutputText(data);

  if (!outputText) {
    return NextResponse.json(
      { error: "A IA nao retornou texto estruturado." },
      { status: 502 },
    );
  }

  let result: NutritionAssistantApiResponse["result"];

  try {
    result = JSON.parse(outputText) as NutritionAssistantApiResponse["result"];
  } catch {
    return NextResponse.json(
      {
        error: "Nao foi possivel interpretar a resposta da IA.",
        result: createFallbackResult(body),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ result });
}

function extractOutputText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string" && content.text.trim()) {
        return content.text;
      }
    }
  }

  return "";
}

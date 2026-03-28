import OpenAI from "openai";
import { dietPayloadSchema, type DietPayload } from "@/types/diet";
import { buildDietSystemPrompt, buildDietUserPrompt, type WizardInput } from "./diet-prompt";

function normalizeDietJson(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const o = data as Record<string, unknown>;
  const sl = o.shoppingList;
  if (sl && typeof sl === "object") {
    const s = { ...(sl as Record<string, unknown>) };
    const aliases: [string, string][] = [
      ["Zabka", "Żabka"],
      ["zabka", "Żabka"],
      ["Biedronka", "Biedronka"],
      ["biedronka", "Biedronka"],
      ["Lidl", "Lidl"],
      ["lidl", "Lidl"],
    ];
    for (const [from, to] of aliases) {
      if (s[from] !== undefined && s[to] === undefined) {
        s[to] = s[from];
        delete s[from];
      }
    }
    o.shoppingList = s;
  }
  return o;
}

export async function generateDietWithOpenAI(input: WizardInput): Promise<DietPayload> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Brak OPENAI_API_KEY");
  const openai = new OpenAI({
    apiKey: key,
    maxRetries: 1,
    timeout: 55_000,
  });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildDietSystemPrompt() },
      {
        role: "user",
        content:
          buildDietUserPrompt(input) +
          "\n\nWygeneruj pełny plan na 7 dni (days z day 1..7). Każdy dzień musi mieć co najmniej 4 posiłki.",
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Pusta odpowiedź modelu");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model zwrócił niepoprawny JSON");
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "payload" in parsed &&
    typeof (parsed as { payload: unknown }).payload === "object"
  ) {
    parsed = (parsed as { payload: unknown }).payload;
  }

  parsed = normalizeDietJson(parsed);

  const result = dietPayloadSchema.safeParse(parsed);
  if (!result.success) {
    console.error(result.error.flatten());
    throw new Error("Struktura diety nie przeszła walidacji — spróbuj ponownie.");
  }
  return result.data;
}

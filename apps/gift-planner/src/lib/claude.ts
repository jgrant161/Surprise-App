import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/** All model calls for this app live here. */

const ParsedIdeasSchema = z.object({
  ideas: z.array(
    z.object({
      personName: z.string().nullable(),
      title: z.string(),
      notes: z.string().nullable(),
      sourceQuote: z.string().nullable(),
      estimatedPriceCents: z.number().int().nullable(),
    }),
  ),
});

export type ParsedIdea = z.infer<typeof ParsedIdeasSchema>["ideas"][number];

export type ParseIdeasResult = {
  ideas: ParsedIdea[];
  /** true when no ANTHROPIC_API_KEY is configured and sample output was returned */
  demo: boolean;
};

export type PersonHint = { id: string; name: string; interests: string };

export function isDemoMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY;
}

export async function parseIdeas(input: { text: string; people: PersonHint[] }): Promise<ParseIdeasResult> {
  if (isDemoMode()) return { ideas: demoIdeas(input), demo: true };

  const client = new Anthropic();
  const roster = input.people
    .map((p) => `- ${p.name}${p.interests ? ` (likes: ${p.interests})` : ""}`)
    .join("\n");

  const response = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: [
      "You turn casual family notes into gift ideas for a gift-planning app.",
      "Each idea is for exactly one person. Match personName to a name from the household roster",
      "when the text clearly refers to them (nicknames and roles like 'Mom' count); otherwise null.",
      "title: a short shoppable product or experience name. notes: helpful detail (color, size, model, why).",
      "sourceQuote: the words from the note that this idea came from, verbatim or close.",
      "estimatedPriceCents: a rough US retail price in cents if you have a good sense of it, else null.",
      "Do not invent ideas that are not in the text.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: `Household roster:\n${roster}\n\nNote:\n${input.text}`,
      },
    ],
    output_config: { format: zodOutputFormat(ParsedIdeasSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to process that note. Try rephrasing it.");
  }
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Could not read gift ideas from that note. Try again with a bit more detail.");
  return { ideas: parsed.ideas, demo: false };
}

/** Deterministic sample so the whole flow is clickable without an API key. */
function demoIdeas(input: { text: string; people: PersonHint[] }): ParsedIdea[] {
  const names = input.people.map((p) => p.name);
  const pick = (preferred: string) => names.find((n) => n.toLowerCase() === preferred.toLowerCase()) ?? names[0] ?? null;
  const lower = input.text.toLowerCase();
  // names in the order they appear in the note, so each idea lands on the person mentioned nearest it
  const mentioned = names
    .map((n) => ({ n, at: lower.indexOf(n.toLowerCase()) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((x) => x.n);
  const first = mentioned[0] ?? pick("Mom");
  const second = mentioned[1] ?? pick("Jake");
  return [
    {
      personName: first,
      title: "Garden kneeler and seat",
      notes: "Foldable, with tool pouch. Demo output: add ANTHROPIC_API_KEY for real parsing.",
      sourceQuote: "wants a garden kneeler",
      estimatedPriceCents: 3999,
    },
    {
      personName: second,
      title: "LEGO Icons Rivendell set",
      notes: "Big build, the Lord of the Rings set he keeps mentioning.",
      sourceQuote: "keeps talking about the Lego Rivendell set",
      estimatedPriceCents: 49999,
    },
  ];
}

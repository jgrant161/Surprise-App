import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const ExtractedEventSchema = z.object({
  title: z.string(),
  date: z.string().describe("YYYY-MM-DD"),
  startTime: z.string().nullable().describe("HH:MM 24h, or null"),
  endTime: z.string().nullable().describe("HH:MM 24h, or null"),
  allDay: z.boolean(),
  location: z.string().nullable(),
  bring: z.string().nullable().describe("Things to bring / wear / prepare"),
  notes: z.string().nullable(),
  members: z.array(z.string()).describe("Family member names this applies to (from the given list)"),
  confidence: z.enum(["high", "medium", "low"]),
  sourceText: z.string().describe("The exact text in the source this event came from"),
});

export const ExtractionSchema = z.object({
  events: z.array(ExtractedEventSchema),
  warnings: z.array(z.string()),
});

export type ExtractedEvent = z.infer<typeof ExtractedEventSchema>;
export type Extraction = z.infer<typeof ExtractionSchema> & { demo: boolean };

export type ExtractInput = {
  image?: { mime: string; base64: string };
  text?: string;
  today: string; // YYYY-MM-DD
  timezone: string;
  memberNames: string[];
};

export const MODEL = "claude-opus-5-5";

export function hasApiKey() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function systemPrompt({ today, timezone, memberNames }: ExtractInput) {
  return `You turn school newsletters, sports schedules, flyers, emails and group-chat screenshots into calendar events for a busy family.

Today is ${today} (${timezone}). Family members: ${memberNames.length ? memberNames.join(", ") : "(none listed)"}.

Rules:
- Return every dated event you can find. Skip anything with no date.
- Infer the year from today's date. Dates are in the future unless the source clearly says otherwise.
- Expand recurring ranges ("every Tuesday through Nov 12", "Mon/Wed/Fri in October") into individual events, at most 25.
- Keep titles short and parent-friendly ("Picture Day", "Soccer practice"), no trailing punctuation.
- Times in 24h HH:MM. If there is no time, set allDay true and times null. Estimate endTime only when the source gives it.
- Put anything a parent must bring, wear, sign or pay in "bring" (e.g. "water bottle, cleats", "$5 for pizza").
- When the source names a child, team or grade that matches a family member, list that member in "members"; otherwise leave it empty.
- confidence: high when date and time are explicit, medium when you inferred the year or time, low when the date itself is a guess.
- warnings: anything a parent should double check (ambiguous dates, cut-off text, "tentative").`;
}

const DEMO: Omit<Extraction, "demo"> = {
  events: [
    {
      title: "Picture Day",
      date: "",
      startTime: null,
      endTime: null,
      allDay: true,
      location: "Lincoln Elementary",
      bring: "Order form + payment, wear uniform shirt",
      notes: "Retakes on a later date, see office",
      members: [],
      confidence: "high",
      sourceText: "PICTURE DAY is next Thursday! Return order forms by Wednesday.",
    },
    {
      title: "Soccer practice",
      date: "",
      startTime: "17:30",
      endTime: "18:30",
      allDay: false,
      location: "Riverside Park, Field 3",
      bring: "Water bottle, shin guards",
      notes: null,
      members: [],
      confidence: "high",
      sourceText: "Practice Tuesdays 5:30-6:30 at Riverside Field 3",
    },
    {
      title: "Soccer practice",
      date: "",
      startTime: "17:30",
      endTime: "18:30",
      allDay: false,
      location: "Riverside Park, Field 3",
      bring: "Water bottle, shin guards",
      notes: null,
      members: [],
      confidence: "high",
      sourceText: "Practice Tuesdays 5:30-6:30 at Riverside Field 3",
    },
    {
      title: "PTA meeting",
      date: "",
      startTime: "19:00",
      endTime: null,
      allDay: false,
      location: "School library",
      bring: null,
      notes: "Childcare provided",
      members: [],
      confidence: "medium",
      sourceText: "PTA meets the 2nd Monday at 7pm in the library. Childcare provided.",
    },
  ],
  warnings: ["Demo mode: these are sample events. Add ANTHROPIC_API_KEY to extract real ones."],
};

function demoExtraction(input: ExtractInput): Extraction {
  // Place demo events in the coming two weeks relative to `today`.
  const base = new Date(input.today + "T00:00:00Z");
  const plus = (n: number) => {
    const d = new Date(base.getTime());
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const nextWeekday = (weekday: number, offsetWeeks = 0) => {
    const d = new Date(base.getTime());
    const diff = (weekday - d.getUTCDay() + 7) % 7 || 7;
    d.setUTCDate(d.getUTCDate() + diff + offsetWeeks * 7);
    return d.toISOString().slice(0, 10);
  };
  const kids = input.memberNames.slice(-2);
  const events = DEMO.events.map((e, i) => ({
    ...e,
    members: i === 0 ? kids : i === 3 ? [] : kids.slice(0, 1),
  }));
  events[0].date = plus(8);
  events[1].date = nextWeekday(2);
  events[2].date = nextWeekday(2, 1);
  events[3].date = nextWeekday(1, 1);
  return { ...DEMO, events, demo: true };
}

export async function extractEvents(input: ExtractInput): Promise<Extraction> {
  if (!input.image && !input.text?.trim()) throw new Error("Nothing to extract from.");
  if (!hasApiKey()) return demoExtraction(input);

  const client = new Anthropic();
  const content: Anthropic.ContentBlockParam[] = [];
  if (input.image) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: input.image.mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: input.image.base64,
      },
    });
  }
  content.push({
    type: "text",
    text: input.text?.trim()
      ? `Extract the events from this text:\n\n${input.text.trim()}`
      : "Extract the events from this image.",
  });

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: systemPrompt(input),
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(ExtractionSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to read this. Try a clearer photo or paste the text instead.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("That source was too long to process in one go. Try a smaller section.");
  }
  if (!response.parsed_output) {
    throw new Error("Could not understand the response. Please try again.");
  }
  return { ...response.parsed_output, demo: false };
}

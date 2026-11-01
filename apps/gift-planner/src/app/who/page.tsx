import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { people } from "@/db/schema";
import { getHousehold } from "@/lib/household";
import { Avatar } from "@/components/Avatar";

export const metadata = { title: "Who are you?" };

export default async function WhoPage({ searchParams }: PageProps<"/who">) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : null;
  const household = await getHousehold();
  const members = await db
    .select()
    .from(people)
    .where(and(eq(people.householdId, household.id), eq(people.isMember, 1)))
    .orderBy(people.name);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <div className="mx-auto mb-3 h-16 w-16 rounded-3xl bg-accent" aria-hidden />
        <h1 className="text-3xl font-black tracking-tight">Surprise</h1>
        <p className="mt-1 text-muted">Who&apos;s planning gifts right now?</p>
        <p className="mt-1 text-xs text-muted">Your own surprises stay hidden from you.</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-center text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}

      {members.length === 0 ? (
        <div className="card text-center">
          <p className="font-semibold">No family members yet.</p>
          <p className="mt-1 text-sm text-muted">
            Run <code className="font-mono">npm run db:seed</code> for sample data, or add the first member below.
          </p>
          <FirstMemberForm />
        </div>
      ) : (
        <ul className="grid gap-3">
          {members.map((m) => (
            <li key={m.id}>
              <form method="post" action="/api/who" className="card flex items-center gap-3">
                <input type="hidden" name="personId" value={m.id} />
                <Avatar name={m.name} color={m.color} size={44} />
                <span className="flex-1 text-left text-lg font-semibold">{m.name}</span>
                {m.pin ? (
                  <input
                    name="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="PIN"
                    required
                    className="input w-24 text-center tracking-widest"
                    aria-label={`PIN for ${m.name}`}
                  />
                ) : null}
                <button className="btn-primary">Go</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-muted">
        Kids and grandparents who only receive gifts don&apos;t log in. Manage everyone under <Link href="/people" className="underline">People</Link> once you&apos;re in.
      </p>
    </main>
  );
}

function FirstMemberForm() {
  return (
    <form method="post" action="/api/who" className="mt-4 grid gap-2 text-left">
      <input type="hidden" name="createFirst" value="1" />
      <label className="label">Your name</label>
      <input name="name" required className="input" placeholder="e.g. Mom" />
      <label className="label">Optional 4-digit PIN</label>
      <input name="pin" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} className="input" placeholder="1234" />
      <button className="btn-primary mt-2">Create and sign in</button>
    </form>
  );
}

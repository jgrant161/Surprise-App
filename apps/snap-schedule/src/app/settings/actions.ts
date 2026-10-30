"use server";

import { redirect } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { deleteAccount } from "@/lib/families";

export async function signOutAction() {
  await signOut();
  redirect("/");
}

export async function deleteMyAccount(form: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (form.get("confirm") !== "on") return;
  await deleteAccount(session.user.id);
  await signOut();
  redirect("/?deleted=1");
}

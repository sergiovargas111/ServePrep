"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import prisma from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function signInWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/sign-in?error=invalid");
    }
    throw error;
  }
}

export async function signInAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/sign-in?error=invalid");
  }

  await signInWithCredentials(parsed.data.email, parsed.data.password);
}

const signUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/sign-up?error=invalid");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    redirect("/sign-up?error=exists");
  }

  const hashedPassword = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword,
    },
  });

  await signInWithCredentials(parsed.data.email, parsed.data.password);
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

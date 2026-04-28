"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function exhibitData(formData: FormData) {
  const title = text(formData, "title");
  const slug = slugify(text(formData, "slug") || title);

  if (!title || !slug) {
    throw new Error("Title and slug are required.");
  }

  return {
    title,
    slug,
    artist: text(formData, "artist") || null,
    gallery: text(formData, "gallery") || "Room 1",
    period: text(formData, "period") || null,
    description: text(formData, "description"),
    imageUrl: text(formData, "imageUrl") || null,
    symbol: text(formData, "symbol") || "Art",
    colorA: text(formData, "colorA") || "#157a7e",
    colorB: text(formData, "colorB") || "#c99635",
    displayOrder: Number(text(formData, "displayOrder")) || 0,
    isActive: formData.get("isActive") === "on"
  };
}

export async function createExhibit(formData: FormData) {
  const exhibit = await prisma.exhibit.create({
    data: exhibitData(formData)
  });

  revalidatePath("/");
  revalidatePath("/admin/exhibits");
  redirect(`/admin/exhibits/${exhibit.id}`);
}

export async function updateExhibit(id: string, formData: FormData) {
  await prisma.exhibit.update({
    where: { id },
    data: exhibitData(formData)
  });

  revalidatePath("/");
  revalidatePath("/admin/exhibits");
  revalidatePath(`/admin/exhibits/${id}`);
  redirect("/admin/exhibits");
}

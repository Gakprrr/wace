import { db } from "@/db";
import { ValidationError, NotFoundError } from "@/utils/auth";

export async function getPublicContacts() {
  return db.socialContact.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getAllContacts() {
  return db.socialContact.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createContact(data: {
  platform: string;
  label: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}) {
  return db.socialContact.create({
    data: {
      platform: data.platform,
      label: data.label,
      url: data.url,
      icon: data.icon,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
    },
  });
}

export async function updateContact(
  id: string,
  data: {
    platform?: string;
    label?: string;
    url?: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  return db.socialContact.update({
    where: { id },
    data,
  });
}

export async function deleteContact(id: string) {
  return db.socialContact.delete({
    where: { id },
  });
}

export async function toggleContact(id: string) {
  const contact = await db.socialContact.findUnique({ where: { id } });
  if (!contact) throw new NotFoundError("Contact non trouvé");

  return db.socialContact.update({
    where: { id },
    data: { isActive: !contact.isActive },
  });
}

export async function reorderContacts(orderedIds: string[]) {
  // Check for duplicates
  const uniqueIds = new Set(orderedIds);
  if (uniqueIds.size !== orderedIds.length) {
    throw new ValidationError("orderedIds contient des doublons");
  }

  // Verify all provided IDs exist
  const existingContacts = await db.socialContact.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true },
  });

  if (existingContacts.length !== orderedIds.length) {
    throw new NotFoundError("Un ou plusieurs contacts sont introuvables");
  }

  const updates = orderedIds.map((id, index) =>
    db.socialContact.update({
      where: { id },
      data: { order: index },
    })
  );
  return db.$transaction(updates);
}

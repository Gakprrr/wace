import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/backend/db";
import { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // spec: salt rounds = 12
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(
  payload: {
    userId: string;
    email: string;
    role: Role;
    twoFactorVerified?: boolean;
  },
  expiresIn: string = "24h"
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ userId: string; email: string; role: Role; twoFactorVerified?: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
      twoFactorVerified: payload.twoFactorVerified as boolean | undefined,
    };
  } catch (error) {
    return null;
  }
}

export async function registerUser(data: {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: Role;
}) {
  const hashedPassword = data.password ? await hashPassword(data.password) : null;

  return db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: data.role ?? Role.CLIENT,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatar: true,
      twoFactorEnabled: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}

export async function getUserProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      twoFactorEnabled: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; avatar?: string }
) {
  return db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function deleteUserAccount(userId: string) {
  return db.user.delete({
    where: { id: userId },
  });
}

export async function listAllUsers() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      twoFactorEnabled: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function toggleUserActive(userId: string, active: boolean) {
  return db.user.update({
    where: { id: userId },
    data: { isActive: active },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  });
}

export async function deleteUserByAdmin(userId: string) {
  return db.user.delete({
    where: { id: userId },
  });
}

export async function updateAdminCredentials(
  userId: string,
  data: { name?: string; email?: string; newPassword?: string }
) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.newPassword) {
    updateData.password = await hashPassword(data.newPassword);
  }

  return db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
    },
  });
}

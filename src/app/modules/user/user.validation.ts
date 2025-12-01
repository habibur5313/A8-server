import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

// ⬇️ Reusable validations
const stringRequired = (field: string) =>
  z.string().min(1, { message: `${field} is required` });

const emailRequired = z
  .string()
  .email({ message: "Invalid email format" });

const numberRequired = (field: string) =>
  z.number({ error: `${field} must be a number` });


// =====================
// ⭐ CREATE ADMIN
// =====================
const createAdmin = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),

  admin: z.object({
    name: stringRequired("Name"),
    email: emailRequired,
    contactNumber: stringRequired("Contact number"),
  }),
});


// =====================
// ⭐ CREATE GUIDE
// =====================
const createGuide = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),

  guide: z.object({
    name: stringRequired("Name"),
    email: emailRequired,
    contactNumber: stringRequired("Contact number"),

    gender: z.enum([Gender.MALE, Gender.FEMALE], {
      message: "Gender must be either MALE or FEMALE",
    }),

    address: z.string().optional(),
    district: z.string().optional(),

    registrationNumber: stringRequired("Registration number"),

    experience: z
      .number()
      .nonnegative({ message: "Experience must be a positive number" })
      .optional(),

    languages: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),

    appointmentFee: numberRequired("Appointment fee"),

    qualification: stringRequired("Qualification"),
    about: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
  }),
});


// =====================
// ⭐ CREATE TOURIST
// =====================
const createTourist = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),

  tourist: z.object({
    email: emailRequired,
    name: stringRequired("Name"),

    contactNumber: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    preferences: z.array(z.string()).optional(),
    emergencyContact: z.string().optional(),
  }),
});


// =====================
// ⭐ UPDATE STATUS
// =====================
const updateStatus = z.object({
  body: z.object({
    status: z.enum(
      [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.DELETED],
      {
        message: "Invalid user status",
      }
    ),
  }),
});


export const userValidation = {
  createAdmin,
  createGuide,
  createTourist,
  updateStatus,
};

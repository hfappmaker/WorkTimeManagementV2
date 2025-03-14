import * as z from "zod";
import { UserRole } from "@prisma/client";

interface UserData {
  password?: string;
  newPassword?: string;
  newPasswordConfirmation?: string;
}

const passwordRequired = (
  data: UserData,
  passwordField: keyof UserData,
  newPasswordField: keyof UserData,
  newPasswordConfirmationField: keyof UserData = "newPasswordConfirmation"
) => {
  const newPasswordEntered = data[newPasswordField] !== undefined;
  const confirmationEntered = data[newPasswordConfirmationField] !== undefined;

  if (newPasswordEntered && !confirmationEntered) {
    return false;
  }

  return !(
    (data[passwordField] && !data[newPasswordField]) ||
    (data[newPasswordField] && !data[passwordField])
  );
};

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(1)),
    newPassword: z.optional(
      z.string().min(6, {
        message:
          "Please enter a new password with at least 6 characters, required",
      })
    ),
    newPasswordConfirmation: z.optional(
      z.string().min(6, {
        message:
          "Please confirm your password with at least 6 characters, required",
      })
    ),
  })
  .refine((data) => passwordRequired(data, "password", "newPassword"), {
    message:
      "Please enter a new password with at least 6 characters, required!",
    path: ["newPassword"],
  })
  .refine((data) => passwordRequired(data, "newPassword", "password"), {
    message: "Please enter your valid password, required!",
    path: ["password"],
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords do not match.",
    path: ["newPasswordConfirmation"],
  });

export const NewPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "Please enter your password, required",
    }),
    passwordConfirmation: z.string().min(6, {
      message: "Please confirm your password, required.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address, required.",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address. Email is required.",
  }),
  password: z.string().min(1, {
    message: "Please enter your password. Password is required.",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: "Please enter your name, required.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address, required.",
    }),
    password: z.string().min(6, {
      message: "Please enter a password with at least 6 characters, required",
    }),
    passwordConfirmation: z.string().min(6, {
      message: "Please confirm your password, required.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

const DaySchema = z.object({
  userId: z.string(),
  projectId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const MonthlyAttendanceSchema = z.object({
  days: z.array(DaySchema),
});

export const ContractSchema = z.object({
  userId: z.string().min(1, { message: "User is required" }),
  clientId: z.string().min(1, { message: "Client is required" }),
  name: z.string().min(1, { message: "Contract name is required" }),
  startDate: z.preprocess((val) => val ? typeof val === "string" ? new Date(val) : val : undefined, z.date()),
  endDate: z.preprocess((val) => val ? typeof val === "string" ? new Date(val) : val : undefined, z.date().nullable().optional()),
  unitPrice: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  settlementMin: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  settlementMax: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  rateType: z.enum(["upperLower", "middle"]).default("upperLower"),
  upperRate: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  lowerRate: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  middleRate: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  closingDay: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  dailyWorkMinutes: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  monthlyWorkMinutes: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
  basicStartTime: z.string().datetime().nullable().optional(),
  basicEndTime: z.string().datetime().nullable().optional(),
  basicBreakDuration: z.preprocess((val) => val ? typeof val === "string" ? Number(val) : val : undefined, z.number().nullable().optional()),
});

export const ClientSchema = z.object({
  createUserId: z.string().min(1, { message: "User is required" }),
  name: z.string().min(1, { message: "Client name is required" }),
  contactName: z.optional(z.string()),
  email: z.optional(z.string().email({ message: "Please enter a valid email address, required." })),
});

export const EmailTemplateSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  body: z.string().min(1, { message: "Body is required" }),
  createUserId: z.string().min(1, { message: "User is required" }),
});


import { z } from "zod";

const trimmedString = (max: number) => z.string().trim().min(1).max(max);
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const LoginSchema = z.object({
  login: trimmedString(255),
  password: z.string().min(1).max(200),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(12).max(200),
  displayName: trimmedString(100),
});

export const UserSettingsSchema = z
  .object({
    display_name: trimmedString(100).optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    min_amount: z.coerce.number().int().min(1000).max(100_000_000).optional(),
    max_amount: z.coerce.number().int().min(1000).max(100_000_000).optional(),
    avatar_url: z
      .string()
      .trim()
      .max(500)
      .url()
      .optional()
      .transform((value) => (value === "" ? null : value)),
    bank_name: trimmedString(50).optional(),
    bank_account: trimmedString(50).optional(),
  })
  .refine(
    (value) =>
      value.min_amount === undefined ||
      value.max_amount === undefined ||
      value.min_amount <= value.max_amount,
    { message: "min_amount must be less than or equal to max_amount" }
  );

export const DonationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["success", "pending", "failed"]).optional(),
});

export const DonationCreateSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/),
  donorName: trimmedString(100).transform((value) => value.replace(/[<>"']/g, "")),
  donorEmail: z.string().trim().toLowerCase().email().max(255),
  amount: z.coerce.number().int().positive().max(100_000_000),
  message: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value.replace(/[<>]/g, "") : undefined)),
});

export const OrderIdSchema = z.string().regex(/^DON-[A-Za-z0-9_-]{16}$/);
export const StatusTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,}$/);
export const DonationIdSchema = z.string().uuid();

export const OverlaySettingsSchema = z.object({
  alert_sound: z.enum(["default", "none"]).optional(),
  alert_duration: z.coerce.number().min(5000).optional(),
  overlay_style: z.enum(["right", "left", "none"]).optional(),
  overlay_animation: z
    .enum([
      "slide-up",
      "slide-down",
      "slide-left",
      "slide-right",
      "fade",
      "zoom",
      "bounce",
      "flip",
      "elastic",
      "blur-in",
      "swing",
    ])
    .optional(),
  overlay_animation_duration: z.coerce.number().int().min(200).max(1500).optional(),
  overlay_animation_enabled: z.boolean().optional(),
  overlay_bg_color: hexColor.optional(),
  overlay_border_color: hexColor.optional(),
  overlay_text_color: hexColor.optional(),
  overlay_message_color: hexColor.optional(),
  overlay_accent_color: hexColor.optional(),
  overlay_progress_color: hexColor.optional(),
  overlay_progress_enabled: z.boolean().optional(),
  action_text: z.string().trim().max(50).optional(),
});

export const UserPatchSchema = z.object({
  action: z.enum(["regenerate_keys"]),
});

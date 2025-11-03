import { z } from 'zod';

// Confidence level for each avatar part match
export const ConfidenceSchema = z.object({
  face: z.number().min(0).max(100),
  nose: z.number().min(0).max(100),
  mouth: z.number().min(0).max(100),
  eyes: z.number().min(0).max(100),
  eyebrows: z.number().min(0).max(100),
  glasses: z.number().min(0).max(100),
  hair: z.number().min(0).max(100),
  accessories: z.number().min(0).max(100),
  details: z.number().min(0).max(100),
  beard: z.number().min(0).max(100),
});

// Zod schema for Claude's structured output with confidence scores
export const AvatarAnalysisSchema = z.object({
  face: z.number().int().min(0).max(9),
  nose: z.number().int().min(0).max(9),
  mouth: z.number().int().min(0).max(9),
  eyes: z.number().int().min(0).max(9),
  eyebrows: z.number().int().min(0).max(9),
  glasses: z.number().int().min(0).max(9).nullable(),
  hair: z.number().int().min(0).max(29),
  accessories: z.number().int().min(0).max(9).nullable(),
  details: z.number().int().min(0).max(9).nullable(),
  beard: z.number().int().min(0).max(9).nullable(),
  flip: z.boolean().optional(),
  confidence: ConfidenceSchema.optional(),
  suggestions: z
    .object({
      hairDescription: z.string().optional(),
      needsCustomHair: z.boolean().optional(),
    })
    .optional(),
});

export type AvatarAnalysis = z.infer<typeof AvatarAnalysisSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;

// API Response types
export interface AnalyzeSelfieResponse {
  success: boolean;
  config?: AvatarAnalysis;
  error?: string;
  lowConfidenceParts?: string[];
}

export interface AnalyzeSelfieRequest {
  image: File | Blob;
}

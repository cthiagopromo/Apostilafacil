'use server';
/**
 * @fileOverview An AI agent that suggests accessibility improvements for content.
 *
 * - getAccessibilityImprovements - A function that handles the accessibility improvement suggestions process.
 * - GetAccessibilityImprovementsInput - The input type for the getAccessibilityImprovements function.
 * - GetAccessibilityImprovementsOutput - The return type for the getAccessibilityImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAccessibilityImprovementsInputSchema = z.object({
  contentHTML: z
    .string()
    .describe('The HTML content to be analyzed for accessibility improvements.'),
  theme: z
    .string()
    .optional()
    .describe('The theme of the content, which may affect contrast.'),
});
export type GetAccessibilityImprovementsInput = z.infer<typeof GetAccessibilityImprovementsInputSchema>;

const GetAccessibilityImprovementsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggestions for improving the accessibility of the content.'),
  contrastAnalysis: z
    .string()
    .describe('An analysis of the contrast of the content, with specific recommendations.'),
});
export type GetAccessibilityImprovementsOutput = z.infer<typeof GetAccessibilityImprovementsOutputSchema>;

export async function getAccessibilityImprovements(input: GetAccessibilityImprovementsInput): Promise<GetAccessibilityImprovementsOutput> {
  return accessibilityImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accessibilityImprovementsPrompt',
  input: {schema: GetAccessibilityImprovementsInputSchema},
  output: {schema: GetAccessibilityImprovementsOutputSchema},
  prompt: `You are an AI assistant specialized in accessibility.  You analyze HTML content and provide suggestions for improvement, focusing on WCAG AA standards.

Analyze the following HTML content:

{{{contentHTML}}}

Consider the theme: {{{theme}}}

Provide specific suggestions for improving accessibility, including contrast analysis and real-time feedback.
Give contrast suggestions and recommendations to enhance readability.
Suggestions should include specific details. For example, instead of saying "Increase contrast", provide specific color adjustments.
Contrast Analysis and suggestions should be included in the output.
`, // Updated to provide more context and instructions
});

const accessibilityImprovementsFlow = ai.defineFlow(
  {
    name: 'accessibilityImprovementsFlow',
    inputSchema: GetAccessibilityImprovementsInputSchema,
    outputSchema: GetAccessibilityImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

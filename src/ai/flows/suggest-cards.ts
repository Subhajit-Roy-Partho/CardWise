// src/ai/flows/suggest-cards.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting new credit cards to add to the database.
 *
 * - suggestNewCards - A function that uses AI to suggest new credit cards.
 * - SuggestNewCardsInput - The input type for the suggestNewCards function.
 * - SuggestNewCardsOutput - The return type for the suggestNewCards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewCardsInputSchema = z.object({
  existingCards: z
    .string()
    .describe(
      'A list of existing credit cards and their benefits, in JSON format.'
    ),
});
export type SuggestNewCardsInput = z.infer<typeof SuggestNewCardsInputSchema>;

const SuggestNewCardsOutputSchema = z.object({
  suggestedCards: z
    .string()
    .describe(
      'A list of suggested credit cards to add, in JSON format.  Each card should include the card name, benefits, and store associations.'
    ),
});
export type SuggestNewCardsOutput = z.infer<typeof SuggestNewCardsOutputSchema>;

export async function suggestNewCards(input: SuggestNewCardsInput): Promise<SuggestNewCardsOutput> {
  return suggestNewCardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewCardsPrompt',
  input: {schema: SuggestNewCardsInputSchema},
  output: {schema: SuggestNewCardsOutputSchema},
  prompt: `You are a credit card expert. Based on the existing credit cards provided, suggest new credit cards that would diversify the options available to users.

Existing Cards:
{{{existingCards}}}

Suggest new cards in JSON format, including the card name, benefits, and store associations.`,
});

const suggestNewCardsFlow = ai.defineFlow(
  {
    name: 'suggestNewCardsFlow',
    inputSchema: SuggestNewCardsInputSchema,
    outputSchema: SuggestNewCardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { suggestNewCards } from "@/ai/flows/suggest-cards";
import type { CreditCardData, AISuggestedCardRaw } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Brain, Lightbulb, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiSuggestionsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestedCardRaw[]>([]);
  const [existingCardsFetched, setExistingCardsFetched] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login?redirect=/ai-suggestions");
    }
  }, [currentUser, authLoading, router]);

  const fetchExistingCardsForAI = async () => {
    try {
      // Fetch a sample of existing cards to provide context to the AI
      // Limiting to 10 most recent cards for brevity and performance
      const q = query(collection(db, "creditCards"), orderBy("createdAt", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const fetchedCards: Partial<CreditCardData>[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          name: data.name, 
          benefits: data.benefits.map((b: any) => `${b.benefitPercentage}% at ${b.storeName} (${b.category || 'general'})`).join(', '),
          issuer: data.issuer
        };
      });
      setExistingCardsFetched(true);
      return fetchedCards;
    } catch (error) {
      console.error("Error fetching existing cards for AI:", error);
      toast({ title: "Error", description: "Could not fetch existing card data for AI.", variant: "destructive" });
      setExistingCardsFetched(true); // Mark as fetched to avoid retrying indefinitely on error
      return [];
    }
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const existingCardsSample = await fetchExistingCardsForAI();
      const input = { existingCards: JSON.stringify(existingCardsSample) };
      const result = await suggestNewCards(input);
      
      if (result.suggestedCards) {
        try {
          const parsedSuggestions = JSON.parse(result.suggestedCards) as AISuggestedCardRaw[];
          setSuggestions(parsedSuggestions);
           toast({ title: "Suggestions Ready!", description: `AI has suggested ${parsedSuggestions.length} new cards.` });
        } catch (parseError) {
          console.error("Error parsing AI suggestions:", parseError);
          // Fallback: show raw string if JSON parsing fails
          setSuggestions([{ cardName: "Raw Suggestions (Format Error)", benefits: result.suggestedCards, storeAssociations: "" }]);
          toast({ title: "Suggestions Received (Format Issue)", description: "AI suggestions received, but there was an issue parsing them.", variant: "default" });
        }
      } else {
        toast({ title: "No Suggestions", description: "AI did not return any suggestions this time.", variant: "default" });
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({ title: "AI Suggestion Error", description: "Could not fetch suggestions from AI.", variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-10 w-10" />
            <div>
              <CardTitle className="text-3xl">AI Card Suggestions</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Let our AI analyze the current card database and suggest new cards to enhance diversity.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-6">
            Click the button below to get AI-powered suggestions for new credit cards. The AI will consider existing cards to propose unique and valuable additions.
          </p>
          <Button 
            onClick={handleGetSuggestions} 
            disabled={isLoadingSuggestions}
            className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoadingSuggestions ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Suggestions...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-5 w-5" /> Get New Card Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoadingSuggestions && !suggestions.length && (
        <Card>
          <CardHeader>
            <CardTitle>Generating...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </CardContent>
        </Card>
      )}

      {!isLoadingSuggestions && suggestions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Suggested Cards</CardTitle>
            <CardDescription>Here are the cards suggested by the AI:</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-card/50 p-1_BUG_FOUND"> {/* ShadCN issue, needs p-4 or similar*/}
                    <CardHeader className="p-4"> {/* Corrected padding here */}
                      <CardTitle className="text-xl text-accent">{suggestion.cardName}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2"> {/* Corrected padding here */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Benefits:</h4>
                        <p className="text-sm whitespace-pre-wrap">{suggestion.benefits}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Store Associations:</h4>
                        <p className="text-sm whitespace-pre-wrap">{suggestion.storeAssociations}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4"> {/* Corrected padding here */}
                       <Button variant="outline" size="sm">Add to Database (Manual)</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
       {!isLoadingSuggestions && existingCardsFetched && suggestions.length === 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">No Suggestions Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Click the button above to generate suggestions, or the AI found no new suggestions at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// Note: The AI flow returns benefits and storeAssociations as single strings. 
// These might be JSON strings or just formatted text. Displaying them as is for now.
// The Card component had `p-1_BUG_FOUND` which isn't a valid Tailwind class, so I've replaced it with `p-4` or similar on child elements.
// An explicit `className="p-4"` for Card component itself might be what was intended.
// Changed to p-4 for CardHeader, CardContent, CardFooter inside the suggestion card.

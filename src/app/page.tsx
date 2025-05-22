
"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// Placeholder data - replace with Firestore fetching
const sampleCards = [
  { id: "1", name: "Super Saver Card", issuer: "Bank X", benefits: [{ storeName: "Walmart", benefitPercentage: 5, description: "on groceries" }], imageUrl: "https://placehold.co/300x180.png", dataAiHint: "credit card" },
  { id: "2", name: "Travel Rewards Plus", issuer: "Bank Y", benefits: [{ storeName: "Any Airline", benefitPercentage: 3, description: "on flights" }], imageUrl: "https://placehold.co/300x180.png", dataAiHint: "credit card travel" },
  { id: "3", name: "Gas Up Card", issuer: "Fuel Co.", benefits: [{ storeName: "Shell", benefitPercentage: 4, description: "per gallon" }], imageUrl: "https://placehold.co/300x180.png", dataAiHint: "credit card fuel" },
];


export default function HomePage() {
  const { currentUser, loading } = useAuth();

  // TODO: Implement Firestore fetching and filtering/sorting controls

  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-card rounded-lg shadow-lg">
        <h1 className="text-5xl font-extrabold text-primary mb-4">
          Welcome to CardWise!
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover the best credit cards tailored to your spending habits. Maximize your rewards and save more.
        </p>
        {!currentUser && !loading && (
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </section>

      {/* TODO: Add filter and sort controls here */}
      {/* <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Featured Credit Cards</h2>
        Filter controls
      </div> */}
      
      <section>
        <h2 className="text-3xl font-semibold text-foreground mb-6">Discover Top Cards</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCards.map(card => (
            <Card key={card.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <Image 
                  src={card.imageUrl} 
                  alt={card.name} 
                  width={300} 
                  height={180} 
                  className="w-full h-48 object-cover" 
                  data-ai-hint={card.dataAiHint}
                />
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl mb-2">{card.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mb-1">{card.issuer}</CardDescription>
                {card.benefits.map((benefit, index) => (
                  <div key={index} className="mt-2">
                    <p className="text-base font-semibold text-accent">
                      {benefit.benefitPercentage}% back at {benefit.storeName}
                    </p>
                    {benefit.description && <p className="text-xs text-muted-foreground">{benefit.description}</p>}
                  </div>
                ))}
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {sampleCards.length === 0 && <p className="text-muted-foreground">No cards available yet. Check back soon!</p>}
      </section>
    </div>
  );
}

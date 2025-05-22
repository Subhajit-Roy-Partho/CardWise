
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import type { CreditCardData } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Edit3, Trash2, ShoppingCart, Fuel, Plane } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to map category to icon
const getCategoryIcon = (category?: string) => {
  if (!category) return <ShoppingCart className="h-4 w-4 text-muted-foreground" />;
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes("gas") || lowerCategory.includes("fuel")) return <Fuel className="h-4 w-4 text-green-500" />;
  if (lowerCategory.includes("travel") || lowerCategory.includes("airline") || lowerCategory.includes("hotel")) return <Plane className="h-4 w-4 text-blue-500" />;
  return <ShoppingCart className="h-4 w-4 text-orange-500" />;
};


export default function MyCardsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login?redirect=/my-cards");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser) {
      const fetchCards = async () => {
        setLoadingCards(true);
        try {
          const q = query(collection(db, "creditCards"), where("addedBy", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          const userCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditCardData));
          setCards(userCards);
        } catch (error) {
          console.error("Error fetching user cards:", error);
          // TODO: Add toast notification for error
        } finally {
          setLoadingCards(false);
        }
      };
      fetchCards();
    }
  }, [currentUser]);

  if (authLoading || !currentUser) {
    return (
       <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-40 w-full rounded-t-md" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  const formatDate = (timestamp: Timestamp | Date) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString();
    }
    return timestamp.toLocaleDateString();
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Added Cards</h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/add-card">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Card
          </Link>
        </Button>
      </div>

      {loadingCards && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-40 w-full rounded-t-md" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loadingCards && cards.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg shadow">
          <CreditCard className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Cards Yet!</h2>
          <p className="text-muted-foreground mb-6">You haven&apos;t added any credit cards. Start by adding your first card.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/add-card">Add Your First Card</Link>
          </Button>
        </div>
      )}

      {!loadingCards && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                {card.imageUrl ? (
                  <Image 
                    src={card.imageUrl} 
                    alt={card.name} 
                    width={300} 
                    height={180} 
                    className="w-full h-48 object-cover rounded-t-md"
                    data-ai-hint="credit card" 
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-md">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <CardTitle className="mt-4 text-2xl">{card.name}</CardTitle>
                {card.issuer && <CardDescription>{card.issuer}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow">
                {card.description && <p className="text-sm text-muted-foreground mb-3">{card.description}</p>}
                <h4 className="font-semibold mb-1 text-foreground">Key Benefits:</h4>
                <ul className="space-y-1 text-sm">
                  {card.benefits.slice(0, 3).map((benefit) => (
                    <li key={benefit.id} className="flex items-start">
                      <span className="mr-2 mt-1">{getCategoryIcon(benefit.category)}</span>
                      <span>
                        <strong>{benefit.benefitPercentage}%</strong> at {benefit.storeName}
                        {benefit.category && <span className="text-xs text-muted-foreground ml-1">({benefit.category})</span>}
                      </span>
                    </li>
                  ))}
                  {card.benefits.length > 3 && <li className="text-xs text-muted-foreground">...and more</li>}
                </ul>
                {card.annualFee && card.annualFee > 0 && (
                  <p className="text-sm mt-2 text-muted-foreground">Annual Fee: ${card.annualFee}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Added on: {formatDate(card.createdAt)}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

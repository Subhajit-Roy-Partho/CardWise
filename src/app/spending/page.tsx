
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AddSpendingForm from "@/components/forms/AddSpendingForm";
import SpendingList from "@/components/spending/SpendingList";
import type { UserSpending } from "@/types"; // Assuming you'll define this
import { Skeleton } from "@/components/ui/skeleton";


export default function SpendingPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [userSpendings, setUserSpendings] = useState<UserSpending[]>([]); // State for spendings
  const [loadingSpendings, setLoadingSpendings] = useState(true);


  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login?redirect=/spending");
    }
  }, [currentUser, loading, router]);

  // Placeholder for fetching spendings
  useEffect(() => {
    if (currentUser) {
      // TODO: Fetch spendings for the current user from Firestore
      // For now, simulate loading and empty state
      const timer = setTimeout(() => {
        setUserSpendings([]); // Or set sample data
        setLoadingSpendings(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setLoadingSpendings(false);
    }
  }, [currentUser]);


  if (loading || !currentUser) {
     return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mt-4" />
            <Skeleton className="h-10 w-full mt-4" />
            <Skeleton className="h-10 w-1/3 mt-4" />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
             <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Track Your Spending</CardTitle>
          <CardDescription>
            Log your expenses to understand your spending patterns and get better card recommendations in the future.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddSpendingForm onSpendingAdded={(newSpending) => setUserSpendings(prev => [newSpending, ...prev])} />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Your Spending History</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingList spendings={userSpendings} isLoading={loadingSpendings} />
        </CardContent>
      </Card>
    </div>
  );
}

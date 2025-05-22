
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Info, Loader2 } from "lucide-react";

export default function AiSuggestionsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login?redirect=/ai-suggestions");
    }
  }, [currentUser, authLoading, router]);

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
            <Info className="h-10 w-10" />
            <div>
              <CardTitle className="text-3xl">AI Card Suggestions Disabled</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                This feature is currently not available.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Info className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
          <p className="text-muted-foreground mb-6">
            The AI-powered card suggestion feature has been removed from the application to enable deployment on the free tier.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

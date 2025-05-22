
"use client";

import type { UserSpending } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Tag, CalendarDays, Info } from "lucide-react";
import { Timestamp } from "firebase/firestore";


interface SpendingListProps {
  spendings: UserSpending[];
  isLoading: boolean;
}

// Helper to format date from Firestore Timestamp or Date object
const formatDate = (timestamp: Timestamp | Date) => {
  if (timestamp instanceof Timestamp) {
    return format(timestamp.toDate(), "MMM dd, yyyy");
  }
  return format(timestamp, "MMM dd, yyyy");
};


export default function SpendingList({ spendings, isLoading }: SpendingListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (spendings.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/50 rounded-md">
        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No spending records found.</p>
        <p className="text-sm text-muted-foreground">Start by adding your expenses using the form above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spendings.map((spending) => (
            <TableRow key={spending.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                   <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground"/> {formatDate(spending.date)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize whitespace-nowrap">
                  <Tag className="h-3 w-3 mr-1.5"/>{spending.category}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{spending.description || "-"}</TableCell>
              <TableCell className="text-right font-semibold">
                <div className="flex items-center justify-end">
                  <DollarSign className="h-4 w-4 mr-1 text-green-600"/> ${spending.amount.toFixed(2)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

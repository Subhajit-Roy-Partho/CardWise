
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { spendingCategories, type SpendingCategory, type UserSpending } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, Tag, StickyNote, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";


const addSpendingSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.enum(spendingCategories, { required_error: "Category is required" }),
  date: z.date({ required_error: "Date is required" }),
  description: z.string().optional(),
  // cardId: z.string().optional(), // TODO: Add card selection later
});

type AddSpendingFormInputs = z.infer<typeof addSpendingSchema>;

interface AddSpendingFormProps {
  onSpendingAdded: (newSpending: UserSpending) => void;
}

export default function AddSpendingForm({ onSpendingAdded }: AddSpendingFormProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue, 
    watch
  } = useForm<AddSpendingFormInputs>({
    resolver: zodResolver(addSpendingSchema),
    defaultValues: {
      date: new Date(),
      category: "Other",
    },
  });
  
  const selectedDate = watch("date");

  const onSubmit: SubmitHandler<AddSpendingFormInputs> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "userSpending"), {
        userId: currentUser.uid,
        amount: data.amount,
        category: data.category,
        date: Timestamp.fromDate(data.date),
        description: data.description || "",
        // cardId: data.cardId || "",
        createdAt: serverTimestamp(),
      });

      const newSpending: UserSpending = {
        id: docRef.id,
        userId: currentUser.uid,
        amount: data.amount,
        category: data.category,
        date: Timestamp.fromDate(data.date),
        description: data.description || "",
        createdAt: Timestamp.now(), // Approximate, actual value is from server
      };
      onSpendingAdded(newSpending);

      toast({
        title: "Spending Added!",
        description: `Your ${data.category} expense of $${data.amount} has been logged.`,
      });
      reset({ date: new Date(), category: "Other", amount: undefined, description: "" });
    } catch (error) {
      console.error("Error adding spending:", error);
      toast({
        title: "Failed to Add Spending",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="amount" type="number" step="0.01" {...register("amount")} placeholder="0.00" className="pl-10" />
          </div>
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
           <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Select
              onValueChange={(value) => setValue("category", value as SpendingCategory)}
              defaultValue={watch('category')}
            >
              <SelectTrigger id="category" className="pl-10">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {spendingCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setValue("date", date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <div className="relative">
          <StickyNote className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Textarea id="description" {...register("description")} placeholder="e.g., Weekly groceries at Walmart" className="pl-10" />
        </div>
      </div>
      
      {/* TODO: Add card selection dropdown here, fetching user's cards */}

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
        ) : (
          <>
           <PlusCircle className="mr-2 h-5 w-5" /> Add Spending
          </>
        )}
      </Button>
    </form>
  );
}

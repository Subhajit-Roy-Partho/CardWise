
"use client";

import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Benefit } from "@/types"; // Import Benefit type

const benefitSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  benefitPercentage: z.coerce.number().min(0.1, "Benefit must be at least 0.1%").max(100, "Benefit cannot exceed 100%"),
  category: z.string().optional(),
  description: z.string().optional(),
});

const addCardSchema = z.object({
  name: z.string().min(3, "Card name must be at least 3 characters"),
  issuer: z.string().optional(),
  description: z.string().optional(),
  annualFee: z.coerce.number().min(0, "Annual fee cannot be negative").optional(),
  benefits: z.array(benefitSchema).min(1, "At least one benefit is required"),
  cardImage: z.any().optional(), // Using any for FileList, will validate manually
});

type AddCardFormInputs = z.infer<typeof addCardSchema>;

export default function AddCardForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AddCardFormInputs>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      benefits: [{ storeName: "", benefitPercentage: 1, category: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "benefits",
  });

  const cardImageFile = watch("cardImage");

  // Handle image preview
  if (cardImageFile && cardImageFile.length > 0 && typeof window !== 'undefined') {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    if (cardImageFile[0] instanceof File) {
        reader.readAsDataURL(cardImageFile[0]);
    }
  } else if (!cardImageFile && imagePreview) {
      setImagePreview(null);
  }


  const onSubmit: SubmitHandler<AddCardFormInputs> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to add a card.", variant: "destructive" });
      return;
    }
    setLoading(true);

    let imageUrl = "";
    if (data.cardImage && data.cardImage.length > 0) {
      const file = data.cardImage[0];
      if (!(file instanceof File)) {
        toast({ title: "Image Error", description: "Invalid image file.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
         toast({ title: "Image Error", description: "Image size should not exceed 5MB.", variant: "destructive" });
         setLoading(false);
         return;
      }
      const storageRef = ref(storage, `card_images/${currentUser.uid}/${Date.now()}_${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Image upload error:", error);
        toast({ title: "Image Upload Failed", description: "Could not upload card image.", variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    try {
      // Ensure benefits have a client-side generated ID for consistency if needed, though Firestore will generate one for the card doc.
      const benefitsWithIds: Benefit[] = data.benefits.map(b => ({ ...b, id: crypto.randomUUID() }));

      await addDoc(collection(db, "creditCards"), {
        name: data.name,
        issuer: data.issuer || "",
        description: data.description || "",
        annualFee: data.annualFee || 0,
        benefits: benefitsWithIds,
        imageUrl: imageUrl,
        addedBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Card Added Successfully!",
        description: `${data.name} has been added to the database.`,
      });
      reset();
      setImagePreview(null);
      router.push("/my-cards"); 
    } catch (error) {
      console.error("Error adding card:", error);
      toast({
        title: "Failed to Add Card",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Card Name</Label>
          <Input id="name" {...register("name")} placeholder="e.g., Super Rewards Card" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuer">Issuer (Optional)</Label>
          <Input id="issuer" {...register("issuer")} placeholder="e.g., Example Bank" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register("description")} placeholder="Briefly describe the card..." />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="annualFee">Annual Fee (Optional)</Label>
        <Input id="annualFee" type="number" step="0.01" {...register("annualFee")} placeholder="e.g., 95" />
        {errors.annualFee && <p className="text-sm text-destructive">{errors.annualFee.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Card Image (Optional, Max 5MB)</Label>
        <Input id="cardImage" type="file" accept="image/png, image/jpeg, image/webp" {...register("cardImage")} className="pt-2"/>
        {imagePreview && (
          <div className="mt-2 border rounded-md p-2 inline-block">
            <img src={imagePreview} alt="Card preview" className="h-24 w-auto object-contain rounded" />
          </div>
        )}
         {errors.cardImage && <p className="text-sm text-destructive">{(errors.cardImage as any).message}</p>}
      </div>


      <div className="space-y-4">
        <Label className="text-lg font-semibold">Benefits</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-card shadow-sm">
            <h4 className="font-medium text-md">Benefit #{index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`benefits.${index}.storeName`}>Store Name</Label>
                <Input id={`benefits.${index}.storeName`} {...register(`benefits.${index}.storeName`)} placeholder="e.g., Walmart" />
                {errors.benefits?.[index]?.storeName && <p className="text-sm text-destructive">{errors.benefits[index]?.storeName?.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`benefits.${index}.benefitPercentage`}>Benefit Percentage (%)</Label>
                <Input id={`benefits.${index}.benefitPercentage`} type="number" step="0.1" {...register(`benefits.${index}.benefitPercentage`)} placeholder="e.g., 5" />
                {errors.benefits?.[index]?.benefitPercentage && <p className="text-sm text-destructive">{errors.benefits[index]?.benefitPercentage?.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`benefits.${index}.category`}>Category (Optional)</Label>
                <Input id={`benefits.${index}.category`} {...register(`benefits.${index}.category`)} placeholder="e.g., Groceries, Travel" />
            </div>
            <div className="space-y-1">
                <Label htmlFor={`benefits.${index}.description`}>Benefit Description (Optional)</Label>
                <Textarea id={`benefits.${index}.description`} {...register(`benefits.${index}.description`)} placeholder="e.g., On all online purchases" />
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="absolute top-3 right-3">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {errors.benefits && !errors.benefits.length && <p className="text-sm text-destructive">{errors.benefits.message}</p>}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ storeName: "", benefitPercentage: 1, category: "", description: "" })}
          className="text-primary border-primary hover:bg-primary/10"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Another Benefit
        </Button>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg" disabled={loading}>
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
        ) : (
          "Add Card"
        )}
      </Button>
    </form>
  );
}

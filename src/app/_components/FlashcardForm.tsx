"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "~/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";

const formSchema = z.object({
  indonesian: z.string().min(1, "Indonesian is required"),
  english: z.string().min(1, "English is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface FlashcardFormProps {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  indonesian: string;
  english: string;
}

export function FlashcardForm({
  onSubmit,
  onCancel,
  indonesian,
  english,
}: FlashcardFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      indonesian,
      english,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold">
        Edit Flashcard
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="indonesian"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Indonesian"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="english"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="English"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

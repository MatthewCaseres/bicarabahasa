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
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  isPublic: z.boolean(),
  priority: z.number().int(),
});

type FormValues = z.infer<typeof formSchema>;

interface NameDescriptionFormProps {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  entityTitle: string;
  entityAction: "Create" | "Edit";
  name: string;
  description: string;
  isPublic: boolean;
  priority: number;
}

export function NameDescriptionForm({
  onSubmit,
  onCancel,
  entityTitle,
  entityAction,
  name,
  description,
  isPublic,
  priority,
}: NameDescriptionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      description,
      isPublic,
      priority,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold">
        {entityAction} {entityTitle}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`${entityTitle} name`}
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a description..."
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
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <div>
                  <FormLabel>Public</FormLabel>
                </div>
                <div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "node_modules/@headlessui/react/dist/components/input/input";
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  url: z.string()
});

type FormValues = z.infer<typeof formSchema>;

interface NameDescriptionFormProps {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  entityTitle: string;
  entityAction: "Create" | "Edit";
  name: string;
  description: string;
  url: string;
}

export function NameDescriptionForm({
  onSubmit,
  onCancel,
  entityTitle,
  entityAction,
  name,
  description,
  url,
}: NameDescriptionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      description,
      url,
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
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Add an image URL..." {...field} />
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

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/trpc/react";
import { useState } from "react";
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
import { EditableLanguageCardList } from "./EditableCardList";
import { generatePrompt } from "./promptGeneratorUtils";
import { TextAreaResize } from "~/components/ui/textarea-resize";

const FormSchema = z.object({
  user_input: z.string(),
});

export function DeckEditor({ deckId }: { deckId: string }) {
  const utils = api.useUtils();
  const createManyCards = api.card.createMany.useMutation({
    onSuccess: async () => {
      await utils.card.getByDeckId.invalidate({ deckId });
    },
  });
  // createManyCards.mutate({cards, deckId})
  function onSubmit(formData: z.infer<typeof FormSchema>) {
    const prompt = generatePrompt({
      user_prompt: formData.user_input,
    });
    setSubmittedPrompt(prompt);
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [submittedPrompt, setSubmittedPrompt] = useState<string>("");

  const { data, isLoading } = api.openai.getStructuredData.useQuery(
    { prompt: submittedPrompt },
    { enabled: !!submittedPrompt },
  );


  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="user_input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Berikan instruksi atau tempelkan teks contoh"
                    className="resize"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      {isLoading && <p>Loading...</p>}
      {data && <EditableLanguageCardList data={data.data} deckId={deckId} />}
    </>
  );
}

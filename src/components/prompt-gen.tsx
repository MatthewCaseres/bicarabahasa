"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type LanguageCode, languageNameMap } from "~/lib/languages";
import { api } from "~/trpc/react";
import { useState } from "react";
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
 
export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  )
}

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
import { LanguageCard, LanguageCardList } from "./language-card";

type PromptGenInput = {
  user_prompt: string;
  native_language: LanguageCode;
  foreign_language: LanguageCode;
  max_pairs: number;
  learning_level: LearningLevel;
};

type LearningLevel = "elementary beginner" | "upper beginner" | "lower intermediate" | "upper intermediate" | "advanced" | "very advanced"

function generatePrompt({
  user_prompt,
  native_language,
  foreign_language,
  max_pairs,
  learning_level,
}: PromptGenInput) {
  return `timestamp: ${new Date().toISOString()}
We are generating pairs of text to learn ${languageNameMap.en[foreign_language]} (${foreign_language}) and ${languageNameMap.en[native_language]} (${native_language}).

format the output like this JSON (use the iso codes):

{
  "data": [
    {
      "${native_language}": "...${languageNameMap.en[foreign_language]} text...",
      "${foreign_language}": "...${languageNameMap.en[native_language]} text..."
    },
    {
      "${native_language}": "...${languageNameMap.en[foreign_language]} text...",
      "${foreign_language}": "...${languageNameMap.en[native_language]} text..."
    },
    ...
  ]
}

Ensure the output is a valid JSON array with at most ${max_pairs} objects.
The ${languageNameMap.en[native_language]} text should always be a translation of the ${languageNameMap.en[foreign_language]} text.

This is a ${learning_level} level of learning, use appropriate vocabulary and sentence length.

### USER PROMPT ###
${user_prompt}
`;
}

export function PromptGen() {
  function onSubmit(formData: z.infer<typeof FormSchema>) {
    const prompt = generatePrompt({
      user_prompt: formData.user_input,
      native_language,
      foreign_language,
      max_pairs: 5,
      learning_level: "beginner",
    });
    setSubmittedPrompt(prompt);
  }
  const native_language = "en";
  const foreign_language = "id";
  const FormSchema = z.object({
    user_input: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [submittedPrompt, setSubmittedPrompt] = useState<string>("");

  const { data, isLoading } = api.openai.getStructuredData.useQuery(
    { prompt: submittedPrompt, native_language, foreign_language },
    { enabled: !!submittedPrompt },
  );

  console.debug(data);

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
                    placeholder="Give instructions or paste sample text"
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
      {data && <LanguageCardList data={data} />}
    </>
  );
}

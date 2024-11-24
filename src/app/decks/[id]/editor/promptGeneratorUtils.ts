type GeneratePromptInput = {
  user_prompt: string;
};

export function generatePrompt({
  user_prompt,
}: GeneratePromptInput) {
  return `timestamp: ${new Date().toISOString()}
We are generating pairs of text to learn english and indonesian.

format the output like this JSON:

{
  "data": [
    {
      "indonesian": "...teks bahasa indonesia...",
      "english": "...english text..."
    },
    {
      "indonesian": "...teks bahasa indonesia...",
      "english": "...english text..."
    },
    ...
  ]
}

The indonesian text should always be a translation of the english text.

### USER PROMPT ###
${user_prompt}
`;
}
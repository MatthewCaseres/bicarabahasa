// import { AIComponent } from "~/components/AIComponent";
import { PromptGen } from "~/components/prompt-gen";

export default function AIPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Component Demo</h1>
      <PromptGen />
      {/* <AIComponent /> */}
    </div>
  );
}

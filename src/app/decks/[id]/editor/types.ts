import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/api/root';
 
type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type AICreateInput = RouterInput['openai']['getStructuredData'];
export type AICreateOutput = RouterOutput['openai']['getStructuredData'];
'use client';
import type { Card } from "@prisma/client";
import { createContext, useContext, useReducer, type ReactNode } from "react";

interface FlashcardState {
  cards: Card[];
  cardQueue: Card[];
}

type FlashcardAction = 
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'PASS_FAILED_CARD' }
  | { type: 'PASS_PASSED_CARD' }
  | { type: 'PASS_FAILED_QUEUE_CARD' }
  | { type: 'PASS_PASSED_QUEUE_CARD' };
const initialState: FlashcardState = {
  cards: [],
  cardQueue: [],
};

function flashcardReducer(state: FlashcardState, action: FlashcardAction): FlashcardState {
  switch (action.type) {
    case 'PASS_FAILED_CARD':
      return {
        ...state,
        cardQueue: [...state.cardQueue, state.cards[0]!],
        cards: state.cards.slice(1),
      };
    case 'PASS_PASSED_CARD':
      return {
        ...state,
        cards: state.cards.slice(1),
      };
    case 'PASS_FAILED_QUEUE_CARD':
      return {
        ...state,
        cardQueue: [...state.cardQueue.slice(1), state.cardQueue[0]!],
      };
    case 'PASS_PASSED_QUEUE_CARD':
      return {
        ...state,
        cardQueue: state.cardQueue.slice(1),
      };
    default:
      return state;
  }
}

const FlashcardContext = createContext<{
  state: FlashcardState;
  dispatch: React.Dispatch<FlashcardAction>;
} | null>(null);

export function FlashcardProvider({ children, initialCards }: { children: ReactNode, initialCards: Card[] }) {
  const [state, dispatch] = useReducer(flashcardReducer, {
    ...initialState,
    cards: initialCards,
  });

  return (
    <FlashcardContext.Provider value={{ state, dispatch }}>
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcard() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcard must be used within a FlashcardProvider');
  }
  return context;
} 

export type FlashcardDispatch = React.Dispatch<FlashcardAction>;

// async function updateUser(dispatch, user, updates) {
// 	dispatch({ type: 'start update', updates })
// 	try {
// 		const updatedUser = await userClient.updateUser(user, updates)
// 		dispatch({ type: 'finish update', updatedUser })
// 	} catch (error) {
// 		dispatch({ type: 'fail update', error })
// 	}
// }

// export { UserProvider, useUser, updateUser }
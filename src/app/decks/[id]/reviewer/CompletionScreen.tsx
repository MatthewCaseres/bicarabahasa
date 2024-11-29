'use client'

interface CompletionScreenProps {
  correctCount: number
  incorrectCount: number
  passedCount: number
}

export function CompletionScreen({ correctCount, incorrectCount, passedCount }: CompletionScreenProps) {
  const totalAttempted = correctCount + incorrectCount + passedCount

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">Session Complete!</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between gap-8">
            <span className="text-gray-600">Correct:</span>
            <span className="font-medium text-green-600">{correctCount}</span>
          </div>
          
          <div className="flex justify-between gap-8">
            <span className="text-gray-600">Incorrect:</span>
            <span className="font-medium text-red-600">{incorrectCount}</span>
          </div>
          
          <div className="flex justify-between gap-8">
            <span className="text-gray-600">Skipped:</span>
            <span className="font-medium text-blue-600">{passedCount}</span>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between gap-8">
              <span className="font-medium text-gray-600">Cards Seen:</span>
              <span className="font-bold">{totalAttempted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

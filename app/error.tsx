"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-red-400 text-lg font-semibold mb-2">Something went wrong</p>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700"
      >
        Try again
      </button>
    </div>
  );
}

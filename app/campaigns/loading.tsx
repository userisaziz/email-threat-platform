export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 bg-gray-800 rounded" />
        <div className="h-4 w-96 bg-gray-800 rounded" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/40 h-14" />
          <div className="divide-y divide-gray-800/60">
            {[1, 2].map((j) => (
              <div key={j} className="px-5 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-48 bg-gray-800 rounded" />
                  <div className="h-3 w-32 bg-gray-800 rounded" />
                </div>
                <div className="h-4 w-8 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

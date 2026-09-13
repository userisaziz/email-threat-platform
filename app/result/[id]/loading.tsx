export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-gray-800 rounded" />
          <div className="h-6 w-72 bg-gray-800 rounded" />
          <div className="h-4 w-56 bg-gray-800 rounded" />
        </div>
        <div className="h-14 w-40 bg-gray-800 rounded-lg" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 h-10 bg-gray-800/40" />
          <div className="px-5 py-4 space-y-2">
            <div className="h-4 w-full bg-gray-800 rounded" />
            <div className="h-4 w-3/4 bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

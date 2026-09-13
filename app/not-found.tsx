export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-black text-gray-800 mb-4">404</p>
      <p className="text-gray-400 mb-6">This page or report does not exist.</p>
      <a
        href="/"
        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
      >
        Analyze an Email
      </a>
    </div>
  );
}

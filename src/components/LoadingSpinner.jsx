export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="mt-4 text-center text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

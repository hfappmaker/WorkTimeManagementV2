export default function Loading() {
  // これはServer Component
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
} 
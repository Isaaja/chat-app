export default function ChatThreadSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`w-full flex ${
            i % 2 === 0 ? "justify-start" : "justify-end"
          }`}
        >
          <div className="skeleton h-10 w-40 max-w-[70%] rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

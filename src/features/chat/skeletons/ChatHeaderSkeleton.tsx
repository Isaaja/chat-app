export default function ChatHeaderSkeleton() {
  return (
    <div className="h-16 border-b border-base-300 flex items-center gap-3 px-4">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="ml-auto flex gap-2">
        <div className="skeleton h-6 w-12" />
        <div className="skeleton h-6 w-12" />
      </div>
    </div>
  );
}

export default function ChatSidebarSkeleton() {
  return (
    <aside className="bg-base-200 border-r border-base-300 w-96 max-w-full flex flex-col">
      <div className="p-4 border-b border-base-300 flex items-center gap-2">
        <div className="skeleton h-6 w-24" />
        <div className="ml-auto" />
      </div>
      <div className="p-3">
        <div className="skeleton h-10 w-full" />
      </div>
      <ul className="menu px-1 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="flex gap-3 items-center py-3 px-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="ml-auto skeleton h-3 w-10" />
                </div>
                <div className="mt-1 skeleton h-3 w-48" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="mb-4 h-14" />
      <div className="card divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 col-span-2" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        ))}
      </div>
    </>
  );
}

import { LoadingState } from "@/components/ui/loading-state";

export default function Loading() {
  return (
    <div className="p-8 h-full flex flex-col justify-center">
      <LoadingState message="Loading..." />
    </div>
  );
}

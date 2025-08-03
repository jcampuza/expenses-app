import { SkeletonCard, SkeletonFormField } from "@/components/Skeletons";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingComponent = () => {
  return (
    <div className="p-4">
      <Skeleton className="mb-2 h-6 w-1/3" />
      <Skeleton className="h-6 w-full" />

      <Separator className="my-8" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export const LoadingFormComponent = () => {
  return (
    <div className="space-y-4">
      <SkeletonFormField />
      <SkeletonFormField />
      <SkeletonFormField />
      <SkeletonFormField />
    </div>
  );
};

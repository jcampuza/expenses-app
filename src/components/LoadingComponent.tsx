import { SkeletonCard, SkeletonFormField } from "@/components/Skeletons";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthSpinner() {
  return (
    <div class="relative container mx-auto flex grow flex-col items-center p-12">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export const LoadingComponent = () => {
  return (
    <div class="p-4">
      <Skeleton class="mb-2 h-6 w-1/3" />
      <Skeleton class="h-6 w-full" />
      <Separator class="my-8" />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export const LoadingFormComponent = () => {
  return (
    <div class="space-y-4">
      <SkeletonFormField />
      <SkeletonFormField />
      <SkeletonFormField />
      <SkeletonFormField />
    </div>
  );
};

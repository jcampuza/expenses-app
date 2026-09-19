import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg font-medium">
          <Skeleton class="h-6 w-1/3" />
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <Skeleton class="h-6 w-full" />
        <Skeleton class="h-6 w-full" />
        <div class="flex items-center gap-2">
          <Skeleton class="h-6 w-1/3" />
          <Skeleton class="h-6 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonFormField() {
  return (
    <div class="space-y-1">
      <Skeleton class="h-4 w-1/3" />
      <Skeleton class="h-8 w-full" />
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div class="container p-4">
      <div class="mb-6">
        <Button variant="ghost" disabled class="hover:bg-transparent">
          <Icon icon={ArrowLeft} class="mr-2 h-4 w-4" />
          <Skeleton class="h-4 w-32" />
        </Button>
      </div>
      <Skeleton class="mb-6 h-8 w-48" />
    </div>
  );
}

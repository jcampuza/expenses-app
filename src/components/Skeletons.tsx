import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          <Skeleton className="h-6 w-1/3" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonFormField() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="container p-4">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" disabled className="hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </Button>
      </div>

      {/* Title */}
      <Skeleton className="mb-6 h-8 w-48" />

      <div className="space-y-6">
        {/* Name field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Theme selector */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>

        {/* Connected Users section */}
        <div className="mt-8">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="rounded-lg border">
            <div className="p-4">
              <div className="space-y-3">
                {/* Table header skeleton */}
                <div className="flex gap-4 border-b pb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="ml-auto h-4 w-12" />
                </div>
                {/* Table rows skeleton */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="ml-auto h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

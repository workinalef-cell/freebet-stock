"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  cards?: number;
  showHeader?: boolean;
}

export function LoadingState({ cards = 1, showHeader = true }: LoadingStateProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg overflow-hidden">
            <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function FreebetLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

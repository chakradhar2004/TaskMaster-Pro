import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function TaskItemSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent />
      <CardFooter className="flex justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </CardFooter>
    </Card>
  );
}

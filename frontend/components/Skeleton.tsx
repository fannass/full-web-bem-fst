import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        ></div>
      ))}
    </>
  );
};

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <Skeleton className="h-10 w-32 mt-auto" />
      </div>
    </div>
  );
};
import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', className = '', style = {} }) => {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        width,
        height,
        backgroundColor: 'rgba(255,255,255,0.05)',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '800px 100%',
        animation: 'skeleton-shimmer 1.5s infinite linear',
        ...style
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-[rgba(255,255,255,0.02)] last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="flex-1">
              <Skeleton height="16px" width={j === 0 ? "40%" : "80%"} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

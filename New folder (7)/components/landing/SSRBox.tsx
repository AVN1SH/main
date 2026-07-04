import React, { Suspense } from "react";

interface SSRBoxProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SSRBox({
  children,
  fallback = <p>Loading...</p>,
}: SSRBoxProps) {
  return (
    <Suspense fallback={fallback}>{children}</Suspense>
  );
}

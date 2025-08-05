'use client';

import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  useEffect(() => {
    // Cập nhật title của trang
    document.title = `${title} - Coffee Supply Chain`;
  }, [title]);

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600">{subtitle}</p>
      )}
    </div>
  );
} 
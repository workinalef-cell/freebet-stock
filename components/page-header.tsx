"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  actions 
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-fedora-blue text-white">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>

        {actions && (
          <div>
            {actions}
          </div>
        )}
      </div>
      <div className="mt-4 h-1 w-20 bg-gradient-to-r from-fedora-blue to-fedora-accent rounded-full" />
    </div>
  );
}
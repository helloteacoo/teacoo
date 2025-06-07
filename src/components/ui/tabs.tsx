import { ReactNode } from 'react';

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
}

export function Tabs({ children, defaultValue }: TabsProps) {
  return <div className="tabs">{children}</div>;
}

interface TabsListProps {
  children: ReactNode;
}

export function TabsList({ children }: TabsListProps) {
  return <div className="tabs-list flex space-x-2">{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <button className="tabs-trigger px-4 py-2 border rounded">
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
}

export function TabsContent({ value, children }: TabsContentProps) {
  return <div className="tabs-content mt-4">{children}</div>;
}

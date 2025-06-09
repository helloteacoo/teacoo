import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <div className="border rounded shadow p-4">{children}</div>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

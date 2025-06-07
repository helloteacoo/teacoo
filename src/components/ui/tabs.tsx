export function Tabs({ children, defaultValue }) {
  return <div className="tabs">{children}</div>;
}

export function TabsList({ children }) {
  return <div className="tabs-list flex space-x-2">{children}</div>;
}

export function TabsTrigger({ value, children }) {
  return (
    <button className="tabs-trigger px-4 py-2 border rounded">
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  return <div className="tabs-content mt-4">{children}</div>;
}

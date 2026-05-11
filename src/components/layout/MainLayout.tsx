import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '64px' : '256px' }}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

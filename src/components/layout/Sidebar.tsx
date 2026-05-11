import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Briefcase,
  MessageCircle,
  Settings,
  User,
  Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const topNavItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Order Management', path: '/orders', icon: ShoppingBag },
  { name: 'Stock', path: '/stock', icon: Package },
  { name: 'Customer', path: '/customer', icon: Users },
  { name: 'Management Team', path: '/team', icon: Briefcase },
];

const bottomNavItems = [
  { name: 'Whatsapp Config', path: '/whatsapp', icon: MessageCircle },
  { name: 'Tenant Management', path: '/tenant', icon: Settings },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className="bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 overflow-hidden"
      style={{ width: isCollapsed ? '64px' : '256px' }}
    >
      {/* Header: Logo + Hamburger */}
      <div className={`h-16 border-b flex items-center flex-shrink-0 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        {!isCollapsed && (
          <span className="text-lg font-bold text-gray-800 whitespace-nowrap overflow-hidden">
            CoreBiz SaaS
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors flex-shrink-0"
          title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Top Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
        {topNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 rounded-md transition-colors ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap overflow-hidden text-sm">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 pb-2 border-t flex flex-col gap-1 pt-2">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 rounded-md transition-colors ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap overflow-hidden text-sm">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}

        {/* Profile Avatar */}
        <div className={`mt-2 py-2 flex ${isCollapsed ? 'justify-center' : 'justify-start px-2'}`}>
          <Avatar
            className="w-9 h-9 border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0"
            title="Profile"
          >
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">Kasir 1</p>
              <p className="text-xs text-gray-400 truncate">Staff</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

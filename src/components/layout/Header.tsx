import { useState } from 'react';
import { ShoppingCart, Bell, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Header() {
  const [isShiftActive, setIsShiftActive] = useState(false);

  const toggleShift = () => {
    setIsShiftActive(!isShiftActive);
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-900 transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              3
            </span>
          </button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              !
            </span>
          </button>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* Shift Persistent Widget */}
        <div className="flex items-center gap-3">
          {isShiftActive ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-9 px-3">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Shift: Running (08:00)
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 h-9 px-3">
              <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
              Shift: Closed
            </Badge>
          )}

          {isShiftActive ? (
            <Button variant="destructive" size="sm" onClick={toggleShift} className="font-semibold">
              Close Shift
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={toggleShift} className="font-bold bg-blue-600 hover:bg-blue-700">
              Open Shift
            </Button>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* Logout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 text-gray-700">
              <span>Kasir 1</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

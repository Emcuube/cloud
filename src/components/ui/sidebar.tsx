import React from 'react';
import { NavLink } from 'react-router-dom';
import { redirectToLogout } from '../../auth/cognito';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export default function Sidebar() {
  const linkClass = (isActive: boolean) =>
    `block px-4 py-3 rounded-md hover:bg-gray-100 ${isActive ? 'bg-gray-200 font-semibold' : 'text-gray-700'}`;

  return (
    <aside className="w-64 bg-white border-r hidden lg:flex lg:flex-col">
      <div className="p-6 flex-1">
        <div className="text-2xl font-bold mb-6">Analytics</div>
        <nav className="space-y-2">
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
            Review Simulator
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>
            Dashboard
          </NavLink>
        </nav>
      </div>

      <div className="p-6 border-t">
        <Button
          variant="default"
          size="default"
          className="w-full flex items-center gap-2 justify-start bg-black text-white hover:bg-gray-900"
          onClick={() => redirectToLogout()}
        >
          <LogOut className="h-4 w-4 text-white" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

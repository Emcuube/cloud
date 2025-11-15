import { NavLink } from 'react-router-dom';
import { redirectToLogout } from '../../auth/cognito';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export default function Sidebar() {
  const linkClass = (isActive: boolean) =>
    `block px-4 py-3 rounded-md transition hover:bg-orange-100 ${
      isActive ? 'bg-orange-50 font-semibold text-orange-600' : 'text-orange-500'
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-white border-r shadow-sm lg:flex lg:flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 text-2xl font-bold text-orange-500">Analytics</div>
        <nav className="space-y-2">
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
            Review Simulator
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>
            Dashboard
          </NavLink>
          <NavLink to="/reviews" className={({ isActive }) => linkClass(isActive)}>
            Review List
          </NavLink>
        </nav>
      </div>

      <div className="border-t p-6">
        <Button
          variant="default"
          size="default"
          className="w-full flex items-center gap-2 justify-start bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => redirectToLogout()}
        >
          <LogOut className="h-4 w-4 text-white" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

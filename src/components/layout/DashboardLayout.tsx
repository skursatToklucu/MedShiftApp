import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, BellIcon, CalendarIcon, UsersIcon, BuildingIcon, HomeIcon, SettingsIcon, ClipboardIcon, LogOutIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import NotificationsPanel from '../ui/NotificationsPanel';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon size={20} /> },
    { name: 'Schedule', path: '/schedule', icon: <CalendarIcon size={20} /> },
    { name: 'Requests', path: '/requests', icon: <ClipboardIcon size={20} /> },
    ...(isAdmin ? [
      { name: 'Users', path: '/users', icon: <UsersIcon size={20} /> },
      { name: 'Clinics', path: '/clinics', icon: <BuildingIcon size={20} /> }
    ] : []),
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-10 flex flex-col w-64 bg-white shadow-sm border-r border-neutral-200 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <span className="text-primary-600 font-bold text-xl">MedShift</span>
          </div>
          <button 
            className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100 md:hidden"
            onClick={toggleSidebar}
          >
            <ChevronLeftIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">{user?.fullName || 'User'}</p>
              <p className="text-xs text-neutral-500">{user?.position || 'Role'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 w-full flex items-center px-4 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <LogOutIcon size={18} className="mr-2" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 border-b border-neutral-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100 md:hidden"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
              </button>
              <h1 className="ml-2 md:ml-0 text-lg font-semibold text-neutral-800">
                {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100 relative"
                onClick={toggleNotifications}
              >
                <BellIcon size={20} />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-error-500"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
          <Outlet />
        </main>
      </div>

      {/* Notifications panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
};

export default DashboardLayout;
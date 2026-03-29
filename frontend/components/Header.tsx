'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/use-auth';
import { NotificationDropdown } from './notifications';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';

const roleDisplayNames: Record<string, string> = {
  ADMIN: 'System Administrator',
  HHRMD: 'Head of HR Management Division',
  HRO: 'Human Resources Officer',
  HRMO: 'HR Management Officer',
  DO: 'District Officer',
  EMP: 'Employee',
  PO: 'Personnel Officer',
  CSCS: 'Civil Service Commission Staff',
  HRRP: 'Human Resources Reporting Person',
};

export function Header() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Breadcrumb / Page Title could go here */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20 lg:hidden">
            <Shield className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-800 leading-tight">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  {roleDisplayNames[user.role] || user.role}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-2">
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>

                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

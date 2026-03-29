'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Notification } from '../../services/notificationService';
import {
  Check,
  Trash2,
  FileText,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Bell,
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function getNotificationIcon(message: string) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('approved')) {
    return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' };
  }
  if (lowerMessage.includes('rejected')) {
    return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' };
  }
  if (lowerMessage.includes('sent back') || lowerMessage.includes('rectification')) {
    return { icon: ArrowRight, color: 'text-amber-500', bg: 'bg-amber-50' };
  }
  if (lowerMessage.includes('complaint')) {
    return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' };
  }
  if (lowerMessage.includes('submitted') || lowerMessage.includes('new')) {
    return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
  if (lowerMessage.includes('user') || lowerMessage.includes('employee')) {
    return { icon: User, color: 'text-purple-500', bg: 'bg-purple-50' };
  }
  return { icon: Bell, color: 'text-primary-500', bg: 'bg-primary-50' };
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { icon: Icon, color, bg } = getNotificationIcon(notification.message);

  const content = (
    <div
      className={`
        group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200
        ${notification.isRead ? 'bg-slate-50/50' : 'bg-primary-50/50 border border-primary-100'}
        hover:bg-slate-100
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg ${bg} ${color} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
          {notification.message}
        </p>
        <span className="text-xs text-slate-400 mt-1 block">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />
      )}

      {/* Actions */}
      {isHovered && (
        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={() => {
          if (!notification.isRead) {
            onMarkAsRead(notification.id);
          }
        }}
        className="block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
      }}
      className="cursor-pointer"
    >
      {content}
    </div>
  );
}

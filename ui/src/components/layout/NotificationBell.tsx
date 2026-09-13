import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { notificationsService, type AppNotification } from '@/services/notifications.service'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const fetchToday = () => {
    setIsLoading(true)
    notificationsService.findToday()
      .then((r) => setNotifications(r.data))
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchToday() }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  function markAsRead(id: string) {
    notificationsService.markAsRead(id).then(() =>
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    )
  }

  function markAllRead() {
    notificationsService.markAllRead().then(() =>
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    )
  }

  function deleteNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    notificationsService.deleteOne(id).then(() =>
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    )
  }

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleNotificationClick(n: AppNotification) {
    if (!n.isRead) markAsRead(n.id)
    if (n.link) navigate(n.link)
    setOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Notifications today</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex items-start border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-blue-50/60' : ''}`}
                >
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className="flex-1 text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                      {!n.isRead && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    {n.message && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </button>
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="shrink-0 self-start mt-2 mr-2 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete notification"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

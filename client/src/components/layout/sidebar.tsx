import {
  BarChart3,
  Wallet,
  History,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Bitcoin,
  Settings,
  Building,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/accounts', icon: Wallet, label: 'Accounts' },
  { href: '/transactions', icon: History, label: 'Transactions' },
  { href: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { href: '/bill-pay', icon: Receipt, label: 'Bill Pay' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/crypto', icon: Bitcoin, label: 'Crypto' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building className="text-primary text-2xl mr-3" />
            <span className="font-bold text-xl text-gray-900">Everstead</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={onClose}
                    className={`
                      w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors cursor-pointer
                      ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <Icon className="mr-3 w-5 h-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

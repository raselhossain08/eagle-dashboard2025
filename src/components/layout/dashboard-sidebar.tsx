"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart3,
  Users,
  Settings,
  FileText,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Folder,
  Activity,
  Database,
  Package,
  Receipt,
  ArrowRightLeft,
  Wrench,
  UserCheck,
  Percent,
  FileCheck,
  FilePlus2,
  PenTool,
  Clock,
  Layout,
  Webhook,
  Lock,
  FileSearch,
  Zap,
  Mail,
  Calculator,
  TrendingUp,
  Globe,
  UserCog,
  MessageSquare,
  StickyNote,
  BookOpen,
  RefreshCw,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const mainNavItems = [
  {
    title: "Overview",
    href: "/",
    icon: Home,
    badge: null,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Visitor Analytics",
    href: "/visitor-analytics",
    icon: TrendingUp,
    badge: null,
  },
  {
    title: "Activity Audit",
    href: "/audit",
    icon: Activity,
    badge: null,
  },
];

const subscriptionItems = [
  {
    title: "All Subscriptions",
    href: "/subscriptions",
    icon: Package,
    badge: null,
  },
  {
    title: "Subscription Plans",
    href: "/plans",
    icon: Database,
    badge: null,
  },
  {
    title: "Discount Codes",
    href: "/discounts",
    icon: Percent,
    badge: null,
  },
];

const contractItems = [
  {
    title: "Active Contracts",
    href: "/contracts",
    icon: FileCheck,
    badge: null,
  },
  {
    title: "Document Templates",
    href: "/contract-templates",
    icon: Layout,
    badge: null,
  },
  {
    title: "Digital Signatures",
    href: "/signatures",
    icon: PenTool,
    badge: null,
  },
];

const paymentItems = [
  {
    title: "Payment Management",
    href: "/payment",
    icon: Wrench,
    badge: null,
  },
  {
    title: "Finance Dashboard",
    href: "/payment/finance",
    icon: TrendingUp,
    badge: null,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: Receipt,
    badge: null,
  },
  {
    title: "Create Invoice",
    href: "/invoices/create",
    icon: FilePlus2,
    badge: null,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowRightLeft,
    badge: null,
  }
];

const billingItems = [
  {
    title: "Billing Overview",
    href: "/billing",
    icon: Receipt,
    badge: null,
  },
  {
    title: "Tax Management",
    href: "/tax",
    icon: FileText,
    badge: null,
  },
  {
    title: "Receipts",
    href: "/billing/receipts",
    icon: FileCheck,
    badge: null,
  },
  {
    title: "Currency Settings",
    href: "/billing/currency-settings",
    icon: Globe,
    badge: null,
  },
  {
    title: "Export Data",
    href: "/billing/export",
    icon: Database,
    badge: null,
  },
];

const adminItems = [
  {
    title: "Admin Users",
    href: "/admin/admin-user",
    icon: Shield,
    badge: null,
  },
  {
    title: "Role Management",
    href: "/admin/roles",
    icon: Users,
    badge: null,
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    icon: Lock,
    badge: null,
  },
  {
    title: "Admin Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileSearch,
    badge: null,
  },
];

const supportToolsItems = [
  {
    title: "User Impersonation",
    href: "/admin/support/impersonate",
    icon: UserCog,
    badge: null,
  },
  {
    title: "Resend Communications",
    href: "/admin/support/resend",
    icon: RefreshCw,
    badge: null,
  },
  {
    title: "Account Notes & Flags",
    href: "/admin/support/notes",
    icon: StickyNote,
    badge: null,
  },
  {
    title: "Saved Replies",
    href: "/admin/support/replies",
    icon: MessageSquare,
    badge: null,
  },
];

const managementItems = [
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    badge: null,
  },
  {
    title: "Customer Profiles",
    href: "/subscriber-profiles",
    icon: UserCheck,
    badge: null,
  },
  {
    title: "WP Migration",
    href: "/wp-migration",
    icon: RefreshCw,
    badge: null,
  },
  {
    title: "WP Dashboard",
    href: "/wp-dashboard",
    icon: Layout,
    badge: null,
  },
  {
    title: "API Webhooks",
    href: "/webhooks",
    icon: Webhook,
    badge: null,
  },
];

const settingsItems = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    badge: null,
  },
  {
    title: "Account Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
  {
    title: "System Settings",
    href: "/system-settings",
    icon: Settings,
    badge: null,
  },
  {
    title: "Setup Wizard",
    href: "/settings/setup",
    icon: Zap,
    badge: null,
  },
  {
    title: "Verify Settings",
    href: "/settings/verify",
    icon: Shield,
    badge: null,
  },
];

const integrationsItems = [
  {
    title: "All Integrations",
    href: "/settings/integrations",
    icon: Zap,
    badge: null,
  },
  {
    title: "Payment Processors",
    href: "/settings/payment-processors",
    icon: CreditCard,
    badge: null,
  },
  {
    title: "Email & SMS Providers",
    href: "/settings/communication-providers",
    icon: Mail,
    badge: null,
  },
  {
    title: "Tax Providers",
    href: "/settings/tax-providers",
    icon: Calculator,
    badge: null,
  },
  {
    title: "Analytics Providers",
    href: "/settings/analytics-providers",
    icon: TrendingUp,
    badge: null,
  },
  {
    title: "Webhooks Config",
    href: "/settings/webhooks-config",
    icon: Globe,
    badge: null,
  },
];

const migrationItems = [
  {
    title: "WordPress Migration",
    href: "/wp-migration",
    icon: RefreshCw,
    badge: null,
  },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export function DashboardSidebar({
  collapsed = false,
  mobileMenuOpen = false,
  onMobileMenuClose
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const NavItem = ({ item, collapsed: collapsed, isMobile: mobile }: {
    item: typeof mainNavItems[0],
    collapsed: boolean,
    isMobile: boolean
  }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={handleLinkClick}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200",
          collapsed && !mobile && "justify-center px-2"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn(
            "w-5 h-5 shrink-0",
            isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
          )} />
          {(!collapsed || mobile) && (
            <span className="font-medium text-sm">{item.title}</span>
          )}
        </div>

        {(!collapsed || mobile) && item.badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
            {item.badge}
          </span>
        )}

        {collapsed && !mobile && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.title}
            {item.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 rounded">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen overflow-y-auto  bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 z-40 shadow-lg ",
        // Desktop behavior
        "lg:translate-x-0",
        collapsed && !isMobile ? "lg:w-20" : "lg:w-64",
        // Mobile behavior
        isMobile && !mobileMenuOpen && "-translate-x-full",
        isMobile ? "w-64" : ""
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 h-16">
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Eagle Dashboard
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Panel
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Main
              </h3>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Subscription Management */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subscription Management
              </h3>
            )}
            <nav className="space-y-1">
              {subscriptionItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Document & Contract Management */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Document Management
              </h3>
            )}
            <nav className="space-y-1">
              {contractItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Financial Management */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment & Finance
              </h3>
            )}
            <nav className="space-y-1">
              {paymentItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Billing & Tax Management */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Billing & Tax
              </h3>
            )}
            <nav className="space-y-1">
              {billingItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Admin Management */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Administration
              </h3>
            )}
            <nav className="space-y-1">
              {adminItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Support Tools */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Support Tools
              </h3>
            )}
            <nav className="space-y-1">
              {supportToolsItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* User & System Management */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User Management
              </h3>
            )}
            <nav className="space-y-1">
              {managementItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Settings & Integrations */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Integrations
              </h3>
            )}
            <nav className="space-y-1">
              {integrationsItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* System Configuration */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                System Settings
              </h3>
            )}
            <nav className="space-y-1">
              {settingsItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>

          {/* Migration Tools */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Migration
              </h3>
            )}
            <nav className="space-y-1">
              {migrationItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        {(!collapsed || isMobile) && (
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-linear-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  John Doe
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

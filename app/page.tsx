'use client';

import { DashboardLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/layout";
import { WithAuth } from "@/components/auth";
import { useAuth } from "@/components/providers";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUpRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

function Home() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumb />
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Good morning, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last 7 days
            </Button>
            <Button size="sm">
              <Activity className="w-4 h-4 mr-2" />
              View Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $45,231.89
                </p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +20.1%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  2,350
                </p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    +12.5%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sales
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12,234
                </p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-cyan-600" />
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                    +19%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Now
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  573
                </p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    +8.2%
                  </span>
                  <span className="text-xs text-gray-500">vs last hour</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New user registered
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      2 minutes ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Add User
                </p>
              </button>
              <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View Reports
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WithAuth(Home);

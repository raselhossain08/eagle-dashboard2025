"use client";

import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Clock, 
  TrendingUp, 
  Eye,
  UserPlus 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserStats } from '@/lib/types';

interface UserStatsCardsProps {
  stats: UserStats | null;
  loading: boolean;
}

export function UserStatsCards({ stats, loading }: UserStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'All registered users',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      description: 'Currently active',
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      description: 'Not currently active',
      icon: UserX,
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      title: 'Suspended Users',
      value: stats.suspendedUsers,
      description: 'Temporarily suspended',
      icon: Shield,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Pending Users',
      value: stats.pendingUsers,
      description: 'Awaiting approval',
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers,
      description: 'Email verified',
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Online Users',
      value: stats.onlineUsers,
      description: 'Currently online',
      icon: Eye,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth,
      description: `${stats.userGrowthPercentage > 0 ? '+' : ''}${stats.userGrowthPercentage.toFixed(1)}% growth`,
      icon: UserPlus,
      color: stats.userGrowthPercentage >= 0 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {card.description}
              </p>
              
              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-20 h-20 opacity-5 ${card.color}`}>
                <Icon className="w-full h-full" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
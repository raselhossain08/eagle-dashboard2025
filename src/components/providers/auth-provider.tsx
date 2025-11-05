/**
 * DEPRECATED: This AuthProvider is deprecated in favor of Zustand-based auth store.
 * Use useAuth from '@/lib/hooks/use-auth' instead.
 * 
 * This file is kept for reference but should not be used in new code.
 * All authentication logic has been migrated to Zustand store for better performance
 * and to avoid Next.js 16 client/server component conflicts.
 */

'use client';

import React from 'react';

// DEPRECATED - DO NOT USE
// Use '@/lib/hooks/use-auth' instead

// Placeholder exports to prevent import errors during migration
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn('⚠️ AuthProvider is deprecated. Use Zustand auth store instead.');
  return <>{children}</>;
};

export const useAuth = () => {
  throw new Error('❌ AuthProvider useAuth is deprecated. Use useAuth from "@/lib/hooks/use-auth" instead.');
};

// This file has been deprecated and replaced with Zustand auth store
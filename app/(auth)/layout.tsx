import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Eagle Dashboard',
    default: 'Authentication | Eagle Dashboard',
  },
  description: 'Sign in to your Eagle Dashboard account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        {children}
      </div>
    </div>
  );
}
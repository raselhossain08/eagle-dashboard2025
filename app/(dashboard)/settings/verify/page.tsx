import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify - Settings | Eagle Dashboard',
  description: 'Email verification and account verification settings',
}

export default function VerifySettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage email verification and account verification settings.
        </p>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Email Verification</h2>
        <p className="text-muted-foreground">
          Verification settings content will be implemented here.
        </p>
      </div>
    </div>
  )
}
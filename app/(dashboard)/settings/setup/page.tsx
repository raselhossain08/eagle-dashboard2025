import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Setup - Settings | Eagle Dashboard',
  description: 'Configure initial setup and onboarding settings',
}

export default function SetupPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure initial setup and onboarding settings for your application.
        </p>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Initial Configuration</h2>
        <p className="text-muted-foreground">
          Setup page content will be implemented here.
        </p>
      </div>
    </div>
  )
}
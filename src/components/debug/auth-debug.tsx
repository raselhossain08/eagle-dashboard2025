'use client'

import { useEffect, useState } from 'react'
import { clientCookies } from '@/lib/utils/cookies'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AuthDebugPanel() {
    const [authState, setAuthState] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check URL for debug parameter
        const params = new URLSearchParams(window.location.search)
        if (params.get('debug') === 'auth') {
            setIsVisible(true)
        }

        // Get auth state
        const updateAuthState = () => {
            const { token, user } = clientCookies.getAuthCookies()
            const tokenHealth = clientCookies.getTokenHealth()

            setAuthState({
                hasToken: !!token,
                tokenPreview: token ? `${token.substring(0, 30)}...` : null,
                user: user,
                tokenHealth,
                cookies: document.cookie.split(';').map(c => c.trim()),
                authStatus: clientCookies.getAuthenticationStatus(),
                apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not set'
            })
        }

        updateAuthState()

        // Update every 2 seconds
        const interval = setInterval(updateAuthState, 2000)

        return () => clearInterval(interval)
    }, [])

    if (!isVisible || !authState) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
            <Card className="shadow-lg border-2 border-yellow-500">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">🔍 Auth Debug Panel</CardTitle>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    <CardDescription className="text-xs">
                        Add ?debug=auth to URL to show this panel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                    <div>
                        <div className="font-semibold mb-1">Status:</div>
                        <Badge variant={authState.hasToken ? "default" : "destructive"}>
                            {authState.authStatus}
                        </Badge>
                    </div>

                    <div>
                        <div className="font-semibold mb-1">Token:</div>
                        <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                            {authState.hasToken ? authState.tokenPreview : 'No token'}
                        </code>
                    </div>

                    {authState.user && (
                        <div>
                            <div className="font-semibold mb-1">User:</div>
                            <div className="bg-gray-100 p-2 rounded space-y-1">
                                <div><strong>ID:</strong> {authState.user.id}</div>
                                <div><strong>Email:</strong> {authState.user.email}</div>
                                <div><strong>Role:</strong> {authState.user.role || authState.user.adminLevel}</div>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="font-semibold mb-1">Token Health:</div>
                        <div className="bg-gray-100 p-2 rounded space-y-1">
                            <div>Valid: {authState.tokenHealth.isValid ? '✅' : '❌'}</div>
                            <div>Has Token: {authState.tokenHealth.hasToken ? '✅' : '❌'}</div>
                            <div>Has User Data: {authState.tokenHealth.hasUserData ? '✅' : '❌'}</div>
                        </div>
                    </div>

                    <div>
                        <div className="font-semibold mb-1">API URL:</div>
                        <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                            {authState.apiUrl}
                        </code>
                    </div>

                    <div>
                        <div className="font-semibold mb-1">Cookies ({authState.cookies.length}):</div>
                        <div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                            {authState.cookies.map((cookie: string, i: number) => (
                                <div key={i} className="text-xs mb-1 break-all">
                                    {cookie}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            clientCookies.clearAuthCookies()
                            window.location.href = '/login'
                        }}
                        className="w-full bg-red-500 text-white px-3 py-2 rounded text-xs hover:bg-red-600"
                    >
                        Clear Auth & Logout
                    </button>
                </CardContent>
            </Card>
        </div>
    )
}

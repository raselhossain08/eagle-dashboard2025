'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
    wpMigrationService,
    type WordPressUser,
    type MigrationProgress,
    type MigrationResult,
    type PaginationInfo,
    type MigrationStats,
    type MigrationStatusItem
} from '@/lib/services/wp-migration.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
    Users,
    Download,
    CheckCircle2,
    XCircle,
    Loader2,
    Search,
    RefreshCw,
    UserPlus,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Settings,
    DownloadCloud
} from 'lucide-react';

export default function WPMigrationPage() {
    const [wpUsers, setWpUsers] = useState<WordPressUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        per_page: 50,
        total_users: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [tempApiUrl, setTempApiUrl] = useState('');
    const [tempApiKey, setTempApiKey] = useState('');
    const [subscriptionApiUrl, setSubscriptionApiUrl] = useState('');
    const [tempSubscriptionApiUrl, setTempSubscriptionApiUrl] = useState('');
    const [bulkImporting, setBulkImporting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, percentage: 0 });
    const [migrationStatuses, setMigrationStatuses] = useState<Map<number, MigrationStatusItem>>(new Map());
    const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
    const [loadingStatuses, setLoadingStatuses] = useState(false);

    // Load settings from cookies on mount
    useEffect(() => {
        const savedUrl = Cookies.get('wp_api_url');
        const savedKey = Cookies.get('wp_api_key');
        const savedSubUrl = Cookies.get('wp_subscription_api_url');

        const initialUrl = savedUrl || 'http://my-testting.local/wp-json/api_master/v1/users';
        const initialKey = savedKey || 'am_test_3ba67a073980c2bb644ec0c53ab4557fbd52dff53cecb5075e2098773ce0a594_2025';
        const initialSubUrl = savedSubUrl || 'http://my-testting.local/wp-json/api_master/v1/subscriptions';

        setApiUrl(initialUrl);
        setApiKey(initialKey);
        setTempApiUrl(initialUrl);
        setTempApiKey(initialKey);
        setSubscriptionApiUrl(initialSubUrl);
        setTempSubscriptionApiUrl(initialSubUrl);
    }, []);

    // Fetch WordPress users on mount
    const fetchUsers = async (page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching WordPress users for page:', page);
            const response = await wpMigrationService.fetchWordPressUsers(page, 50, apiUrl, apiKey);
            console.log('Received response:', response);
            console.log('Users:', response.users);
            console.log('Pagination:', response.pagination);

            if (!response || !response.users) {
                setError('No data received from WordPress API');
                setWpUsers([]);
                return;
            }

            setWpUsers(Array.isArray(response.users) ? response.users : []);
            setPagination(response.pagination);
            setCurrentPage(page);
            console.log('Users set to state:', response.users.length);

            // Check migration status for fetched users
            if (response.users.length > 0) {
                await checkUsersMigrationStatus(response.users.map(u => u.id));
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
            setWpUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Check migration status for multiple users
    const checkUsersMigrationStatus = async (wpUserIds: number[]) => {
        setLoadingStatuses(true);
        try {
            const statuses = await wpMigrationService.checkMigrationStatus(wpUserIds);
            const statusMap = new Map<number, MigrationStatusItem>();
            statuses.forEach(status => {
                statusMap.set(status.wpUserId, status);
            });
            setMigrationStatuses(statusMap);
        } catch (error) {
            console.error('Error checking migration status:', error);
        } finally {
            setLoadingStatuses(false);
        }
    };

    // Fetch migration stats
    const fetchMigrationStats = async () => {
        try {
            const stats = await wpMigrationService.getMigrationStats();
            setMigrationStats(stats);
        } catch (error) {
            console.error('Error fetching migration stats:', error);
        }
    };

    useEffect(() => {
        // Only fetch if API settings are loaded
        if (apiUrl && apiKey) {
            fetchUsers(1);
            fetchMigrationStats(); // Fetch stats on mount
        }
    }, [apiUrl, apiKey]); // Refetch when API settings change

    // Pagination handlers
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.total_pages) {
            fetchUsers(page);
            setSelectedUsers(new Set()); // Clear selection when changing pages
        }
    };

    const nextPage = () => {
        if (pagination.has_next) {
            goToPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (pagination.has_prev || currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    // Settings handlers
    const saveSettings = () => {
        // Save to cookies (expires in 365 days)
        Cookies.set('wp_api_url', tempApiUrl, { expires: 365 });
        Cookies.set('wp_api_key', tempApiKey, { expires: 365 });
        Cookies.set('wp_subscription_api_url', tempSubscriptionApiUrl, { expires: 365 });

        setApiUrl(tempApiUrl);
        setApiKey(tempApiKey);
        setSubscriptionApiUrl(tempSubscriptionApiUrl);
        setShowSettings(false);
        setCurrentPage(1);
    };

    const cancelSettings = () => {
        setTempApiUrl(apiUrl);
        setTempApiKey(apiKey);
        setTempSubscriptionApiUrl(subscriptionApiUrl);
        setShowSettings(false);
    };

    // Filter users based on search
    const filteredUsers = Array.isArray(wpUsers) ? wpUsers.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    // Toggle user selection
    const toggleUserSelection = (userId: number) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Select all filtered users
    const selectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    // Migrate selected users
    const migrateSelectedUsers = async () => {
        const usersToMigrate = Array.isArray(wpUsers) ? wpUsers.filter(u => {
            const migrationStatus = migrationStatuses.get(u.id);
            return selectedUsers.has(u.id) && !migrationStatus?.isMigrated;
        }) : [];

        if (usersToMigrate.length === 0) {
            setError('No new users selected to migrate. Already migrated users are skipped.');
            return;
        }

        setError(null);
        await wpMigrationService.migrateUsers(usersToMigrate, setMigrationProgress);

        // Refresh migration status and stats after migration
        await checkUsersMigrationStatus(wpUsers.map(u => u.id));
        await fetchMigrationStats();
    };

    // Migrate single user
    const migrateSingleUser = async (user: WordPressUser) => {
        setError(null);
        setMigrationProgress({
            total: 1,
            completed: 0,
            failed: 0,
            inProgress: true,
            results: []
        });

        const result = await wpMigrationService.migrateSingleUser(user);

        setMigrationProgress({
            total: 1,
            completed: result.success ? 1 : 0,
            failed: result.success ? 0 : 1,
            inProgress: false,
            results: [result]
        });

        // Refresh migration status and stats after single migration
        await checkUsersMigrationStatus([user.id]);
        await fetchMigrationStats();
    };

    // Bulk import all users
    const bulkImportAll = async () => {
        setBulkImporting(true);
        setError(null);
        setMigrationProgress({
            total: pagination.total_users,
            completed: 0,
            failed: 0,
            inProgress: true,
            results: []
        });

        try {
            const totalPages = pagination.total_pages;
            let allUsers: WordPressUser[] = [];

            // Fetch all pages
            for (let page = 1; page <= totalPages; page++) {
                setBulkProgress({
                    current: page,
                    total: totalPages,
                    percentage: Math.round((page / totalPages) * 50) // First 50% for fetching
                });

                const response = await wpMigrationService.fetchWordPressUsers(page, 50, apiUrl, apiKey);
                if (response.users) {
                    allUsers = [...allUsers, ...response.users];
                }
            }

            // Check migration status for all users
            const userIds = allUsers.map(u => u.id);
            const statuses = await wpMigrationService.checkMigrationStatus(userIds);
            const migratedIds = new Set(
                statuses.filter(s => s.isMigrated).map(s => s.wpUserId)
            );

            // Filter out already migrated users
            const usersToMigrate = allUsers.filter(u => !migratedIds.has(u.id));

            console.log(`Total users: ${allUsers.length}, Already migrated: ${migratedIds.size}, To migrate: ${usersToMigrate.length}`);

            if (usersToMigrate.length === 0) {
                setError('All users are already migrated!');
                setBulkImporting(false);
                return;
            }

            // Update progress with actual count
            setMigrationProgress(prev => ({
                ...prev!,
                total: usersToMigrate.length
            }));

            // Migrate filtered users
            await wpMigrationService.migrateUsers(usersToMigrate, (progress) => {
                setMigrationProgress(progress);
                const migrationPercentage = Math.round((progress.completed + progress.failed) / progress.total * 50);
                setBulkProgress({
                    current: progress.completed + progress.failed,
                    total: progress.total,
                    percentage: 50 + migrationPercentage // Second 50% for migration
                });
            });

            // Refresh data
            await fetchUsers(currentPage);
            await fetchMigrationStats();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bulk import failed');
        } finally {
            setBulkImporting(false);
            setBulkProgress({ current: 0, total: 0, percentage: 0 });
        }
    };

    // Calculate migration stats
    const getMigrationStats = () => {
        if (!migrationProgress) return null;

        const percentage = migrationProgress.total > 0
            ? Math.round((migrationProgress.completed + migrationProgress.failed) / migrationProgress.total * 100)
            : 0;

        return { percentage };
    };

    const stats = getMigrationStats();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">WordPress Migration</h1>
                    <p className="text-muted-foreground mt-1">
                        Import and migrate WordPress users to Eagle system
                    </p>
                    {apiUrl && !showSettings && (
                        <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                                {new URL(apiUrl).hostname}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={async () => {
                            setLoading(true);
                            setError(null);
                            try {
                                toast.loading('Migrating WordPress subscriptions...', { id: 'wp-sub-migration' });
                                const result = await wpMigrationService.migrateWordPressSubscriptions(
                                    subscriptionApiUrl,
                                    apiKey
                                );

                                if (result.success && result.data) {
                                    toast.success(
                                        `Subscriptions migrated! ${result.data.migrated} created, ${result.data.updated} updated, ${result.data.failed} failed`,
                                        { id: 'wp-sub-migration' }
                                    );

                                    // Refresh stats
                                    await fetchMigrationStats();
                                } else {
                                    throw new Error(result.error || 'Failed to migrate subscriptions');
                                }
                            } catch (error) {
                                console.error('Subscription migration error:', error);
                                toast.error(
                                    error instanceof Error ? error.message : 'Failed to migrate subscriptions',
                                    { id: 'wp-sub-migration' }
                                );
                                setError(error instanceof Error ? error.message : 'Failed to migrate subscriptions');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading || bulkImporting}
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Migrate Subscriptions
                    </Button>
                    <Button
                        onClick={bulkImportAll}
                        disabled={loading || bulkImporting || pagination.total_users === 0}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {bulkImporting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <DownloadCloud className="h-4 w-4 mr-2" />
                                Bulk Import All ({pagination.total_users.toLocaleString()})
                            </>
                        )}
                    </Button>
                    <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                    <Button onClick={() => fetchUsers(currentPage)} disabled={loading} variant="outline">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Settings Card */}
            {showSettings && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            WordPress API Settings
                        </CardTitle>
                        <CardDescription>
                            Configure your WordPress API endpoints and authentication key
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">User Migration API</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">API URL</label>
                                <Input
                                    type="text"
                                    placeholder="http://your-site.com/wp-json/api_master/v1/users"
                                    value={tempApiUrl}
                                    onChange={(e) => setTempApiUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    The full URL to your WordPress users API endpoint
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Key (x-api-key)</label>
                                <Input
                                    type="password"
                                    placeholder="am_test_..."
                                    value={tempApiKey}
                                    onChange={(e) => setTempApiKey(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your WordPress API authentication key
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">Subscription Migration API</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subscription API URL</label>
                                <Input
                                    type="text"
                                    placeholder="http://your-site.com/wp-json/api_master/v1/subscriptions"
                                    value={tempSubscriptionApiUrl}
                                    onChange={(e) => setTempSubscriptionApiUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    The full URL to your WordPress subscriptions API endpoint
                                </p>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Settings are saved in cookies (365 days). After saving, the page will automatically fetch users from the new endpoint.
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={cancelSettings}>
                                Cancel
                            </Button>
                            <Button onClick={saveSettings} disabled={!tempApiUrl || !tempApiKey || !tempSubscriptionApiUrl}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Import Progress */}
            {bulkImporting && (
                <Card className="border-2 border-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                            Bulk Import in Progress
                        </CardTitle>
                        <CardDescription>
                            Fetching and migrating all {pagination.total_users.toLocaleString()} WordPress users
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Overall Progress</span>
                                <span>{bulkProgress.percentage}%</span>
                            </div>
                            <Progress value={bulkProgress.percentage} className="h-3" />
                            <p className="text-xs text-muted-foreground">
                                {bulkProgress.percentage < 50
                                    ? `Fetching users from WordPress API... (${bulkProgress.current}/${bulkProgress.total} pages)`
                                    : `Migrating users to Eagle system... (${bulkProgress.current}/${bulkProgress.total} users)`
                                }
                            </p>
                        </div>

                        {migrationProgress && (
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{migrationProgress.completed}</span>
                                    <span className="text-muted-foreground">Migrated</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="font-medium">{migrationProgress.failed}</span>
                                    <span className="text-muted-foreground">Failed</span>
                                </div>
                            </div>
                        )}

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please do not close this page or navigate away during the bulk import process.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total WP Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total_users.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            On WordPress site
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Migrated</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {migrationStats?.success || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Successfully migrated
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{migrationStats?.last24Hours || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Recent migrations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {migrationStats?.failed || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Migration errors
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Migration Progress */}
            {migrationProgress && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {migrationProgress.inProgress ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Migration in Progress
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Migration Completed
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {migrationProgress.completed + migrationProgress.failed} of {migrationProgress.total} users processed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{stats?.percentage}%</span>
                            </div>
                            <Progress value={stats?.percentage} className="h-2" />
                        </div>

                        {/* Migration Results */}
                        {migrationProgress.results.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <h4 className="font-semibold text-sm">Migration Results:</h4>
                                {migrationProgress.results.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-2 text-sm p-2 rounded ${result.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
                                            }`}
                                    >
                                        {result.success ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="flex-1">
                                            {result.username} ({result.email})
                                        </span>
                                        <span className="text-xs">
                                            {result.success ? result.message : result.error}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* User List Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>WordPress Users</CardTitle>
                            <CardDescription>
                                Select users to migrate to the Eagle system
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={selectAll}
                                variant="outline"
                                disabled={loading || filteredUsers.length === 0}
                            >
                                {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <Button
                                onClick={migrateSelectedUsers}
                                disabled={selectedUsers.size === 0 || migrationProgress?.inProgress}
                            >
                                {migrationProgress?.inProgress ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Migrating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Migrate Selected ({selectedUsers.size})
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name, username, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No WordPress users found</p>
                        </div>
                    ) : (
                        /* User Table */
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onChange={selectAll}
                                                className="rounded"
                                            />
                                        </TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Display Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const migrationStatus = migrationStatuses.get(user.id);
                                        const isMigrated = migrationStatus?.isMigrated || false;

                                        return (
                                            <TableRow key={user.id} className={isMigrated ? 'bg-green-50/50' : ''}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.has(user.id)}
                                                        onChange={() => toggleUserSelection(user.id)}
                                                        disabled={isMigrated}
                                                        className="rounded"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                                <TableCell className="font-medium">{user.username}</TableCell>
                                                <TableCell>{user.display_name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{user.role || 'subscriber'}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.registered ? new Date(user.registered).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {isMigrated ? (
                                                        <Badge variant="default" className="bg-green-600">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Migrated
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => migrateSingleUser(user)}
                                                            disabled={migrationProgress?.inProgress || loadingStatuses}
                                                        >
                                                            <UserPlus className="h-4 w-4 mr-1" />
                                                            Migrate
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && wpUsers.length > 0 && (
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{((currentPage - 1) * pagination.per_page) + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * pagination.per_page, pagination.total_users)}
                                </span>{' '}
                                of <span className="font-medium">{pagination.total_users.toLocaleString()}</span> users
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={prevPage}
                                    disabled={currentPage === 1 || loading}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1">
                                    {/* First page */}
                                    {currentPage > 2 && (
                                        <>
                                            <Button
                                                variant={currentPage === 1 ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => goToPage(1)}
                                                className="w-10"
                                            >
                                                1
                                            </Button>
                                            {currentPage > 3 && (
                                                <span className="px-2 text-muted-foreground">...</span>
                                            )}
                                        </>
                                    )}

                                    {/* Current page and neighbors */}
                                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.total_pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= pagination.total_pages - 2) {
                                            pageNum = pagination.total_pages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        if (pageNum < 1 || pageNum > pagination.total_pages) return null;

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => goToPage(pageNum)}
                                                className="w-10"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}

                                    {/* Last page */}
                                    {currentPage < pagination.total_pages - 1 && (
                                        <>
                                            {currentPage < pagination.total_pages - 2 && (
                                                <span className="px-2 text-muted-foreground">...</span>
                                            )}
                                            <Button
                                                variant={currentPage === pagination.total_pages ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => goToPage(pagination.total_pages)}
                                                className="w-10"
                                            >
                                                {pagination.total_pages}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextPage}
                                    disabled={!pagination.has_next || loading}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

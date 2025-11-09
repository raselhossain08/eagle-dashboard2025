/**
 * WordPress Migration Service
 * Handles fetching and migrating WordPress users
 */

const WP_API_URL = 'http://my-testting.local/wp-json/api_master/v1/users';
const WP_API_KEY = 'am_test_3ba67a073980c2bb644ec0c53ab4557fbd52dff53cecb5075e2098773ce0a594_2025';

export interface WordPressUser {
    id: number;
    username: string;
    email: string;
    name?: {
        display?: string;
        first?: string;
        last?: string;
    };
    // Computed properties for backward compatibility
    display_name?: string;
    first_name?: string;
    last_name?: string;
    roles?: string[];
    role?: string;
    registered?: string;
    url?: string;
    meta?: any;
    sync_info?: any;
    [key: string]: any;
}

export interface MigrationResult {
    success: boolean;
    userId?: string;
    wpUserId: number;
    username: string;
    email: string;
    error?: string;
    message?: string;
    alreadyExists?: boolean;
    migrationDate?: string;
}

export interface MigrationProgress {
    total: number;
    completed: number;
    failed: number;
    inProgress: boolean;
    results: MigrationResult[];
}

export interface PaginationInfo {
    page: number;
    per_page: number;
    total_users: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface WordPressUsersResponse {
    users: WordPressUser[];
    pagination: PaginationInfo;
}

export interface MigrationStats {
    total: number;
    success: number;
    failed: number;
    already_exists: number;
    totalWPUsers: number;
    last24Hours: number;
}

export interface MigrationHistoryItem {
    _id: string;
    wpUserId: number;
    userId: {
        _id: string;
        name: string;
        email: string;
        subscription: string;
        subscriptionStatus: string;
    };
    username: string;
    email: string;
    status: 'success' | 'failed' | 'already_exists';
    migrationType: 'single' | 'bulk' | 'auto';
    migrationSource: string;
    errorMessage?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MigrationHistoryResponse {
    success: boolean;
    history: MigrationHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface MigrationStatusItem {
    wpUserId: number;
    isMigrated: boolean;
    userId?: string;
    status?: string;
    migratedAt?: string;
}

class WordPressMigrationService {
    private apiUrl = WP_API_URL;
    private apiKey = WP_API_KEY;

    /**
     * Fetch all WordPress users
     */
    async fetchWordPressUsers(
        page: number = 1,
        perPage: number = 50,
        customApiUrl?: string,
        customApiKey?: string
    ): Promise<WordPressUsersResponse> {
        const apiUrl = customApiUrl || this.apiUrl;
        const apiKey = customApiKey || this.apiKey;

        try {
            console.log('Fetching from:', apiUrl);
            console.log('Page:', page, 'Per page:', perPage);
            console.log('Using API key:', apiKey.substring(0, 20) + '...');

            const url = new URL(apiUrl);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('per_page', perPage.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch WordPress users: ${response.statusText} (${response.status})`);
            }

            const data = await response.json();
            console.log('Raw API response:', data);
            console.log('Response type:', typeof data);
            console.log('Has data property?', 'data' in data);
            console.log('Has users property?', 'users' in data);

            // Handle nested structure: response.data.users
            let users = [];
            let pagination = {
                page: 1,
                per_page: perPage,
                total_users: 0,
                total_pages: 1,
                has_next: false,
                has_prev: false,
            };

            if (data.data && Array.isArray(data.data.users)) {
                users = data.data.users;
                pagination = data.data.pagination || pagination;
            } else if (Array.isArray(data.users)) {
                users = data.users;
                pagination = data.pagination || pagination;
            } else if (Array.isArray(data)) {
                users = data;
            }

            // Normalize user data to flatten nested properties
            const normalizedUsers = users.map((user: any) => ({
                ...user,
                display_name: user.name?.display || user.display_name || user.username,
                first_name: user.name?.first || user.first_name || '',
                last_name: user.name?.last || user.last_name || '',
                role: Array.isArray(user.roles) ? user.roles[0] : (user.role || 'subscriber'),
            }));

            console.log('Extracted users:', normalizedUsers);
            console.log('Users is array?', Array.isArray(normalizedUsers));
            console.log('Users length:', normalizedUsers.length);
            console.log('Pagination:', pagination);

            return {
                users: normalizedUsers,
                pagination,
            };
        } catch (error) {
            console.error('Error fetching WordPress users:', error);
            throw error;
        }
    }

    /**
     * Migrate a single WordPress user
     */
    async migrateSingleUser(user: WordPressUser): Promise<MigrationResult> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/migrate-wordpress-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wpUserId: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.display_name,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    registeredDate: user.registered,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    wpUserId: user.id,
                    username: user.username,
                    email: user.email,
                    error: result.message || 'Migration failed',
                };
            }

            return {
                success: true,
                userId: result.userId || result.user?._id,
                wpUserId: user.id,
                username: user.username,
                email: user.email,
                message: result.message || 'User migrated successfully',
            };
        } catch (error) {
            return {
                success: false,
                wpUserId: user.id,
                username: user.username,
                email: user.email,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Migrate multiple WordPress users with progress tracking
     */
    async migrateUsers(
        users: WordPressUser[],
        onProgress?: (progress: MigrationProgress) => void
    ): Promise<MigrationProgress> {
        const progress: MigrationProgress = {
            total: users.length,
            completed: 0,
            failed: 0,
            inProgress: true,
            results: [],
        };

        for (const user of users) {
            const result = await this.migrateSingleUser(user);

            progress.results.push(result);

            if (result.success) {
                progress.completed++;
            } else {
                progress.failed++;
            }

            if (onProgress) {
                onProgress({ ...progress });
            }

            // Small delay to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        progress.inProgress = false;
        return progress;
    }

    /**
     * Check if a WordPress user already exists in the system
     */
    async checkUserExists(email: string): Promise<boolean> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-user-exists?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            return result.exists || false;
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    }

    /**
     * Get migration statistics
     */
    async getMigrationStats(): Promise<MigrationStats | null> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/migration-stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch migration stats');
            }

            const result = await response.json();
            return result.stats;
        } catch (error) {
            console.error('Error fetching migration stats:', error);
            return null;
        }
    }

    /**
     * Get migration history with pagination
     */
    async getMigrationHistory(
        page: number = 1,
        limit: number = 50,
        status?: string,
        startDate?: string,
        endDate?: string
    ): Promise<MigrationHistoryResponse | null> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (status) params.append('status', status);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${API_BASE_URL}/auth/migration-history?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch migration history');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching migration history:', error);
            return null;
        }
    }

    /**
     * Check migration status for multiple WordPress users
     */
    async checkMigrationStatus(wpUserIds: number[]): Promise<MigrationStatusItem[]> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-migration-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ wpUserIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to check migration status');
            }

            const result = await response.json();
            return result.statuses || [];
        } catch (error) {
            console.error('Error checking migration status:', error);
            return wpUserIds.map(id => ({ wpUserId: id, isMigrated: false }));
        }
    }

    /**
     * Migrate WordPress subscriptions from WooCommerce
     */
    async migrateWordPressSubscriptions(wpApiUrl: string, wpApiKey: string): Promise<{
        success: boolean;
        data?: {
            total: number;
            migrated: number;
            updated: number;
            failed: number;
            results: any[];
        };
        message?: string;
        error?: string;
    }> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/migrate-wp-subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({
                    wpApiUrl,
                    wpApiKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to migrate subscriptions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error migrating WordPress subscriptions:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to migrate subscriptions'
            };
        }
    }

    /**
     * Get WordPress subscription migration statistics
     */
    async getWPSubscriptionStats(): Promise<{
        success: boolean;
        data?: {
            totalMigrated: number;
            activeSubscriptions: number;
            cancelledSubscriptions: number;
            recentMigrations: number;
            totalMRR: number;
        };
        error?: string;
    }> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/wp-migration-stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subscription migration stats');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching subscription migration stats:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch stats'
            };
        }
    }

    /**
     * Check subscription migration status for emails
     */
    async checkSubscriptionMigrationStatus(emails: string[]): Promise<{
        success: boolean;
        data?: Record<string, {
            isMigrated: boolean;
            subscriptionStatus?: string;
            currentPlan?: string;
        }>;
        error?: string;
    }> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/check-wp-migration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ emails }),
            });

            if (!response.ok) {
                throw new Error('Failed to check subscription migration status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking subscription migration status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to check status'
            };
        }
    }
}

export const wpMigrationService = new WordPressMigrationService();

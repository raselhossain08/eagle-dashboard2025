import ApiService from './shared/api.service';

export interface SearchResult {
    id: string;
    type: 'subscriber' | 'transaction' | 'plan' | 'user';
    title: string;
    subtitle: string;
    url: string;
    metadata?: Record<string, any>;
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    query: string;
}

class SearchService {
    /**
     * Search across all dashboard entities
     */
    async search(query: string, limit: number = 10): Promise<SearchResponse> {
        try {
            if (!query || query.trim().length < 2) {
                return { results: [], total: 0, query };
            }

            // Search across different endpoints in parallel
            const [subscribers, transactions, users] = await Promise.allSettled([
                this.searchSubscribers(query, limit),
                this.searchTransactions(query, limit),
                this.searchUsers(query, limit),
            ]);

            const results: SearchResult[] = [];

            // Combine results from all sources
            if (subscribers.status === 'fulfilled' && subscribers.value) {
                results.push(...subscribers.value);
            }
            if (transactions.status === 'fulfilled' && transactions.value) {
                results.push(...transactions.value);
            }
            if (users.status === 'fulfilled' && users.value) {
                results.push(...users.value);
            }

            // Sort by relevance (you can customize this logic)
            const sortedResults = results.sort((a, b) => {
                const aScore = this.calculateRelevanceScore(a, query);
                const bScore = this.calculateRelevanceScore(b, query);
                return bScore - aScore;
            });

            return {
                results: sortedResults.slice(0, limit),
                total: sortedResults.length,
                query,
            };
        } catch (error) {
            console.error('Search error:', error);
            return { results: [], total: 0, query };
        }
    }

    /**
     * Search subscribers
     */
    private async searchSubscribers(query: string, limit: number): Promise<SearchResult[]> {
        try {
            const response = await ApiService.get<any>(
                `/v1/subscribers?search=${encodeURIComponent(query)}&limit=${limit}`
            );

            const subscribers = response.subscribers || response.data || [];
            return subscribers.map((sub: any) => ({
                id: sub._id || sub.id,
                type: 'subscriber' as const,
                title: sub.user?.fullName || sub.user?.email || 'Unknown Subscriber',
                subtitle: `${sub.plan?.name || 'No Plan'} - ${sub.status}`,
                url: `/subscribers/${sub._id || sub.id}`,
                metadata: {
                    status: sub.status,
                    planName: sub.plan?.name,
                    email: sub.user?.email,
                },
            }));
        } catch (error) {
            console.error('Error searching subscribers:', error);
            return [];
        }
    }

    /**
     * Search transactions
     */
    private async searchTransactions(query: string, limit: number): Promise<SearchResult[]> {
        try {
            const response = await ApiService.get<any>(
                `/transactions?search=${encodeURIComponent(query)}&limit=${limit}`
            );

            const transactions = response.transactions || response.data || [];
            return transactions.map((txn: any) => ({
                id: txn._id || txn.id,
                type: 'transaction' as const,
                title: `Transaction ${txn.transactionId || txn._id}`,
                subtitle: `${txn.amount?.gross || 0} ${txn.amount?.currency || 'USD'} - ${txn.status}`,
                url: `/transactions/${txn._id || txn.id}`,
                metadata: {
                    status: txn.status,
                    amount: txn.amount?.gross,
                    currency: txn.amount?.currency,
                    type: txn.type,
                },
            }));
        } catch (error) {
            console.error('Error searching transactions:', error);
            return [];
        }
    }

    /**
     * Search users
     */
    private async searchUsers(query: string, limit: number): Promise<SearchResult[]> {
        try {
            const response = await ApiService.get<any>(
                `/admin/users?search=${encodeURIComponent(query)}&limit=${limit}`
            );

            const users = response.users || response.data || [];
            return users.map((user: any) => ({
                id: user._id || user.id,
                type: 'user' as const,
                title: user.fullName || user.email,
                subtitle: `${user.email} - ${user.role || 'user'}`,
                url: `/users/${user._id || user.id}`,
                metadata: {
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
            }));
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }

    /**
     * Calculate relevance score for sorting
     */
    private calculateRelevanceScore(result: SearchResult, query: string): number {
        const lowerQuery = query.toLowerCase();
        const lowerTitle = result.title.toLowerCase();
        const lowerSubtitle = result.subtitle.toLowerCase();

        let score = 0;

        // Exact match gets highest score
        if (lowerTitle === lowerQuery) score += 100;
        if (lowerSubtitle === lowerQuery) score += 80;

        // Starts with query
        if (lowerTitle.startsWith(lowerQuery)) score += 50;
        if (lowerSubtitle.startsWith(lowerQuery)) score += 30;

        // Contains query
        if (lowerTitle.includes(lowerQuery)) score += 20;
        if (lowerSubtitle.includes(lowerQuery)) score += 10;

        return score;
    }
}

export default new SearchService();

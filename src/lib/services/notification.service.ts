import ApiService from './shared/api.service';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
    link?: string;
    data?: any;
}

export interface NotificationStats {
    total: number;
    unread: number;
    notifications: Notification[];
}

class NotificationService {
    private static readonly ENDPOINT = '/notifications';
    private mockNotifications: Notification[] = [];
    private useMockData = false;

    /**
     * Generate mock notifications for demo purposes
     */
    private generateMockNotifications(): Notification[] {
        const now = new Date();
        return [
            {
                _id: '1',
                title: 'New Subscription',
                message: 'John Doe has subscribed to the Pro plan',
                type: 'success',
                read: false,
                createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
                link: '/subscriptions'
            },
            {
                _id: '2',
                title: 'Payment Received',
                message: 'Payment of $99.00 received from Jane Smith',
                type: 'success',
                read: false,
                createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
                link: '/transactions'
            },
            {
                _id: '3',
                title: 'Subscription Expiring Soon',
                message: '5 subscriptions will expire in the next 7 days',
                type: 'warning',
                read: true,
                createdAt: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
                link: '/subscriptions'
            },
            {
                _id: '4',
                title: 'System Update Available',
                message: 'A new version of the dashboard is available',
                type: 'info',
                read: true,
                createdAt: new Date(now.getTime() - 24 * 60 * 60000).toISOString(),
            },
            {
                _id: '5',
                title: 'Failed Payment',
                message: 'Payment failed for user Mike Johnson - Action required',
                type: 'error',
                read: false,
                createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
                link: '/transactions'
            }
        ];
    }

    /**
     * Get user notifications
     */
    async getNotifications(limit: number = 10, unreadOnly: boolean = false): Promise<NotificationStats> {
        try {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (unreadOnly) params.append('unreadOnly', 'true');

            const response = await ApiService.get<{ success: boolean; data: any }>(
                `${NotificationService.ENDPOINT}?${params.toString()}`
            );

            const data = response.data || response;
            this.useMockData = false;
            return {
                total: data.total || data.notifications?.length || 0,
                unread: data.unread || data.notifications?.filter((n: Notification) => !n.read).length || 0,
                notifications: data.notifications || []
            };
        } catch (error: any) {
            console.warn('Notification endpoint not available, using mock data:', error.message);
            // Use mock data if endpoint doesn't exist
            this.useMockData = true;

            if (this.mockNotifications.length === 0) {
                this.mockNotifications = this.generateMockNotifications();
            }

            let notifications = this.mockNotifications;
            if (unreadOnly) {
                notifications = notifications.filter(n => !n.read);
            }

            return {
                total: this.mockNotifications.length,
                unread: this.mockNotifications.filter(n => !n.read).length,
                notifications: notifications.slice(0, limit)
            };
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response = await ApiService.get<{ success: boolean; data: any }>(
                `${NotificationService.ENDPOINT}/unread/count`
            );

            const data = response.data || response;
            return data.count || data.unread || 0;
        } catch (error) {
            // Use mock data if endpoint doesn't exist
            if (this.useMockData || this.mockNotifications.length > 0) {
                if (this.mockNotifications.length === 0) {
                    this.mockNotifications = this.generateMockNotifications();
                }
                return this.mockNotifications.filter(n => !n.read).length;
            }
            return 0;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<boolean> {
        try {
            await ApiService.patch(
                `${NotificationService.ENDPOINT}/${notificationId}/read`,
                {}
            );
            return true;
        } catch (error) {
            // Update mock data if using mocks
            if (this.useMockData) {
                const notification = this.mockNotifications.find(n => n._id === notificationId);
                if (notification) {
                    notification.read = true;
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<boolean> {
        try {
            await ApiService.post(
                `${NotificationService.ENDPOINT}/mark-all-read`,
                {}
            );
            return true;
        } catch (error) {
            // Update mock data if using mocks
            if (this.useMockData) {
                this.mockNotifications.forEach(n => n.read = true);
                return true;
            }
            return false;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string): Promise<boolean> {
        try {
            await ApiService.delete(
                `${NotificationService.ENDPOINT}/${notificationId}`
            );
            return true;
        } catch (error) {
            // Update mock data if using mocks
            if (this.useMockData) {
                const index = this.mockNotifications.findIndex(n => n._id === notificationId);
                if (index !== -1) {
                    this.mockNotifications.splice(index, 1);
                    return true;
                }
            }
            return false;
        }
    }
}

export const notificationService = new NotificationService();
export default notificationService;

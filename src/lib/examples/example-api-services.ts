/**
 * 🌟 Example API Service - Demonstrating Bulletproof Authentication
 * 
 * This example shows how to use the Eagle Auth system with any API:
 * ✅ Automatic token inclusion in ALL requests
 * ✅ No manual token management needed
 * ✅ Built-in error handling and retry logic
 * ✅ TypeScript support with proper types
 * ✅ Easy to use and maintain
 */

import apiClient from '@/lib/auth/api-client';
import type { ApiResponse } from '@/lib/auth/api-client';

// Example types for your API responses
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 🏢 Example Service - Users Management
 * 
 * Shows how to create API services with automatic authentication
 */
export class ExampleUserService {
  
  /**
   * 📋 Get all users with pagination
   */
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}): Promise<PaginatedResponse<User>> {
    // Token is automatically included - no manual work needed!
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    
    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiClient.get<PaginatedResponse<User>>(url);
  }

  /**
   * 👤 Get single user by ID
   */
  static async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  /**
   * ➕ Create new user
   */
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<User> {
    return apiClient.post<User>('/users', userData);
  }

  /**
   * ✏️ Update user
   */
  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, userData);
  }

  /**
   * 🗑️ Delete user
   */
  static async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/users/${id}`);
  }

  /**
   * 🔄 Change user role (admin only)
   */
  static async changeUserRole(id: string, role: string): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/role`, { role });
  }

  /**
   * 📤 Upload user avatar
   */
  static async uploadAvatar(id: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.upload<{ avatarUrl: string }>(`/users/${id}/avatar`, formData);
  }
}

/**
 * 💰 Example Service - Transactions Management
 * 
 * Another example showing different API patterns
 */
export class ExampleTransactionService {
  
  /**
   * 📊 Get user transactions
   */
  static async getUserTransactions(userId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `/users/${userId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiClient.get<PaginatedResponse<Transaction>>(url);
  }

  /**
   * 💳 Process payment
   */
  static async processPayment(data: {
    userId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    description?: string;
  }): Promise<Transaction> {
    return apiClient.post<Transaction>('/transactions/payment', data);
  }

  /**
   * 🔄 Process refund
   */
  static async processRefund(transactionId: string, data: {
    amount?: number;
    reason: string;
  }): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${transactionId}/refund`, data);
  }

  /**
   * 📈 Get transaction analytics
   */
  static async getAnalytics(params: {
    dateFrom: string;
    dateTo: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    successRate: number;
    chartData: Array<{ date: string; amount: number; count: number }>;
  }> {
    return apiClient.get('/transactions/analytics', { 
      headers: {
        'X-Date-From': params.dateFrom,
        'X-Date-To': params.dateTo,
        'X-Group-By': params.groupBy || 'day',
      }
    });
  }
}

/**
 * 📋 Example Usage Documentation
 * 
 * This shows how to use the services in your React components.
 * For full React examples, see example-components.tsx
 */

// Example usage patterns:

/*
// 1. Basic API call with automatic authentication:
const users = await ExampleUserService.getUsers({ page: 1, limit: 10 });

// 2. Error handling is automatic:
try {
  const user = await ExampleUserService.createUser(userData);
  // Success - token was automatically included
} catch (error) {
  // Error automatically handled by API client
  // User sees friendly error message via toast
}

// 3. File uploads with authentication:
const formData = new FormData();
formData.append('avatar', file);
const result = await ExampleUserService.uploadAvatar(userId, formData);

// 4. Using in React hooks:
function useUsers(params = {}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ExampleUserService.getUsers(params)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { users, loading };
}

// 5. With useAuth hook:
function MyComponent() {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) return <LoginRequired />;
  
  // All API calls automatically include user's token
  const handleAction = () => {
    ExampleUserService.getUsers(); // Token included automatically!
  };
  
  return <div>Content</div>;
}
*/

/**
 * 🎯 Key Benefits of This System:
 * 
 * 1. **Zero Token Management**: Tokens are automatically included in ALL requests
 * 2. **Error Handling**: Automatic logout on 401, user-friendly error messages
 * 3. **Type Safety**: Full TypeScript support with proper types
 * 4. **Retry Logic**: Automatic retries with exponential backoff
 * 5. **Development Tools**: Built-in debugging and development helpers
 * 6. **Backwards Compatible**: Works with existing token systems
 * 7. **Performance**: Smart caching and optimizations
 * 8. **Security**: Secure cookie storage with proper settings
 */

console.log('📚 Example API Services loaded');
console.log('💡 Usage:');
console.log('  - ExampleUserService.getUsers()');
console.log('  - ExampleTransactionService.processPayment(data)');
console.log('  - All requests automatically include authentication tokens');
console.log('  - No manual token management needed!');

export default {
  UserService: ExampleUserService,
  TransactionService: ExampleTransactionService,
};
/**
 * Backwards-compatibility adapter
 * Some services import `{ api } from './api'` while the canonical implementation
 * lives in `api.service.ts` as a default `ApiService` export. Export a named
 * `api` binding that proxies to that service so both import styles work.
 */

import ApiService from './api.service';

// Export named binding expected by older modules
export const api = ApiService;

// Also export default for convenience
export default api;

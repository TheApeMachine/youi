import { eventBus } from "./event";

const cache: Record<string, { data: any, timestamp: number }> = {};
const cacheExpirationTime = 60000; // Cache for 60 seconds

// Define the loader that initially returns "loading" state
export const loader = async (
    requests: Record<string, Promise<any> | {
        url: string,
        method?: string,
        params?: Record<string, any>,
        headers?: Record<string, string>
    }>
): Promise<{ state: "loading" | "error" | "success", results: Record<string, any> }> => {
    const now = Date.now();

    const results: Record<string, any> = {};
    try {
        for (const key in requests) {
            const request = requests[key];

            // Handle Promise-based requests (like MongoDB queries)
            if (request instanceof Promise) {
                const cacheKey = `promise:${key}`;

                if (cache[cacheKey] && now - cache[cacheKey].timestamp < cacheExpirationTime) {
                    results[key] = cache[cacheKey].data;
                } else {
                    const data = await request;
                    results[key] = data;
                    eventBus.publish("state", "stateChange", {
                        key,
                        value: data
                    });
                    cache[cacheKey] = { data, timestamp: now };
                }
                continue;
            }

            // Existing HTTP request handling
            const { url, method = "GET", params, headers } = request;
            const cacheKey = `${method}:${url}:${JSON.stringify(params || {})}`;

            // Check cache and expiration
            if (cache[cacheKey] && now - cache[cacheKey].timestamp < cacheExpirationTime) {
                results[key] = cache[cacheKey].data;
            } else {
                const response = await fetchWithParams(url, method, params, headers);
                const data = await response.json();
                results[key] = data;
                eventBus.publish("state", "stateChange", {
                    key,
                    value: data
                });
                cache[cacheKey] = { data, timestamp: now }; // Store with timestamp
            }
        }

        return { state: "success", results };
    } catch (error: any) {
        console.error("loader", "error", error)
        return {
            state: "error",
            results: error instanceof Error ? error : new Error('An unknown error occurred')
        };
    }
};

// Utility function to handle query params or request body based on method
const fetchWithParams = (
    url: string,
    method: string = "GET",
    params?: Record<string, any>,
    headers?: Record<string, string>
) => {
    if (method === "GET" && params) {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${url}?${queryParams}`, { headers: { ...headers } });
    } else {
        return fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...headers },
            body: method !== "GET" ? JSON.stringify(params) : undefined,
        });
    }
};

/// <reference lib="webworker" />
import { registerRoute, Route } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// @ts-ignore
self.__WB_DISABLE_DEV_LOGS = true;

// Handle images:
const imageRoute = new Route(
  ({ request }) => {
    return request.destination === "image";
  },
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
        maxEntries: 10,
      }),
    ],
  }),
);

// Handle scripts:
const scriptsRoute = new Route(
  ({ request }) => {
    return (
      request.url.includes("/static/") && request.url.endsWith(".module.wasm")
    );
  },
  new CacheFirst({
    cacheName: "scripts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 10,
      }),
    ],
  }),
);

// Handle styles:
const stylesRoute = new Route(
  ({ request }) => {
    return (
      request.url.includes("/static/") &&
      (request.url.endsWith(".css") ||
        request.url.endsWith(".ttf") ||
        request.url.endsWith(".woff") ||
        request.url.endsWith(".woff2"))
    );
  },
  new CacheFirst({
    cacheName: "styles",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 10,
      }),
    ],
  }),
);

// Register routes
registerRoute(imageRoute);
registerRoute(scriptsRoute);
registerRoute(stylesRoute);

// const _self = self as unknown as ServiceWorkerGlobalScope;
//
// interface PrecacheEntry {
//   url: string;
//   revision: string;
// }
//
// const PRECACHE_CONFIG: PrecacheEntry[] = [
//   {
//     url: "/static/wasm/9c7067f502ee3ab8.module.wasm",
//     revision: "9c7067f502ee3ab8",
//   },
// ];
//
// const CACHE_NAME_PRECACHE = `precache-cache-${
//   _self.registration ? _self.registration.scope : ""
// }`;
// const CACHE_NAME_DYNAMIC = `dynamic-cache-${
//   _self.registration ? _self.registration.scope : ""
// }`;
//
// const MAX_AGE_DYNAMIC_CACHE_SECONDS = 7 * 24 * 60 * 60; // 1 week in seconds
//
// const HASH_PARAM_NAME = "_precache";
// const DIRECTORY_INDEX = "index.html";
// const IGNORE_URL_PARAMETERS_MATCHING: RegExp[] = [/^utm_/];
//
// const doWeCache = (url: string): boolean => {
//   return url.endsWith(".woff") || url.endsWith(".woff2");
// };
//
// const addDirectoryIndex = (urlString: string, index: string): string => {
//   const url = new URL(urlString);
//   if (url.pathname.endsWith("/")) {
//     url.pathname += index;
//   }
//   return url.toString();
// };
//
// const cleanResponse = async (response: Response): Promise<Response> => {
//   if (response.redirected) {
//     const body = await response.blob();
//     return new Response(body, {
//       headers: response.headers,
//       status: response.status,
//       statusText: response.statusText,
//     });
//   }
//   return Promise.resolve(response);
// };
//
// const createCacheKey = (
//   urlString: string,
//   paramName: string,
//   paramValue: string,
//   hashRegex?: RegExp,
// ): string => {
//   const url = new URL(urlString);
//   if (!hashRegex || !url.pathname.match(hashRegex)) {
//     url.search += `${url.search ? "&" : ""}${encodeURIComponent(
//       paramName,
//     )}=${encodeURIComponent(paramValue)}`;
//   }
//   return url.toString();
// };
//
// const stripIgnoredUrlParameters = (
//   urlString: string,
//   ignoreRegexes: RegExp[],
// ): string => {
//   const url = new URL(urlString);
//   url.hash = "";
//   url.search = url.search
//     .slice(1)
//     .split("&")
//     .map((param) => param.split("="))
//     .filter(([key]) => ignoreRegexes.every((regex) => !regex.test(key)))
//     .map((param) => param.join("="))
//     .join("&");
//   return url.toString();
// };
//
// const urlsToCacheKeys = new Map<string, string>(
//   PRECACHE_CONFIG.map((entry) => {
//     const url = new URL(entry.url, _self.location.origin);
//     const cacheKey = createCacheKey(
//       url.toString(),
//       HASH_PARAM_NAME,
//       entry.revision,
//       /-\w{32}\./,
//     );
//     return [url.toString(), cacheKey];
//   }),
// );
//
// const setOfCachedUrls = async (cache: Cache): Promise<Set<string>> => {
//   const keys = await cache.keys();
//   return new Set(keys.map((request) => request.url));
// };
//
// _self.addEventListener("install", (event: ExtendableEvent) => {
//   event.waitUntil(
//     caches
//       .open(CACHE_NAME_PRECACHE)
//       .then(async (cache) => {
//         const cachedUrls = await setOfCachedUrls(cache);
//         const precachePromises = Array.from(urlsToCacheKeys.values()).map(
//           async (cacheKey) => {
//             if (!cachedUrls.has(cacheKey)) {
//               const request = new Request(cacheKey, {
//                 credentials: "same-origin",
//               });
//               try {
//                 const response = await fetch(request);
//                 if (!response.ok) {
//                   throw new Error(
//                     `Request for ${cacheKey} returned a response with status ${response.status}`,
//                   );
//                 }
//                 const cleanedResponse = await cleanResponse(response);
//                 await cache.put(cacheKey, cleanedResponse);
//               } catch (error) {
//                 console.error(`Failed to precache ${cacheKey}:`, error);
//               }
//             }
//           },
//         );
//         return Promise.all(precachePromises);
//       })
//       .then(() => _self.skipWaiting()),
//   );
// });
//
// _self.addEventListener("activate", (event: ExtendableEvent) => {
//   const expectedCacheKeys = new Set(urlsToCacheKeys.values());
//   event.waitUntil(
//     caches
//       .keys()
//       .then((cacheNames) => {
//         return Promise.all(
//           cacheNames.map((cacheName) => {
//             if (cacheName === CACHE_NAME_PRECACHE) {
//               return caches.open(cacheName).then(async (cache) => {
//                 const cachedRequests = await cache.keys();
//                 const deletePromises = cachedRequests.map(async (request) => {
//                   if (!expectedCacheKeys.has(request.url)) {
//                     console.log(`Deleting old precached asset: ${request.url}`);
//                     await cache.delete(request);
//                   }
//                 });
//                 return Promise.all(deletePromises);
//               });
//             } else if (cacheName !== CACHE_NAME_DYNAMIC) {
//               console.log(`Deleting unknown cache: ${cacheName}`);
//               return caches.delete(cacheName);
//             }
//             // For CACHE_NAME_DYNAMIC, we'll keep it as-is for now,
//             // expiration will be handled on fetches.
//             return Promise.resolve();
//           }),
//         );
//       })
//       .then(() => _self.clients.claim()),
//   );
// });
//
// _self.addEventListener("fetch", (event: FetchEvent) => {
//   if (event.request.method !== "GET") {
//     return;
//   }
//
//   const originalRequestUrl = event.request.url;
//
//   let requestUrl = stripIgnoredUrlParameters(
//     originalRequestUrl,
//     IGNORE_URL_PARAMETERS_MATCHING,
//   );
//
//   let isPrecached = urlsToCacheKeys.has(requestUrl);
//
//   if (!isPrecached) {
//     requestUrl = addDirectoryIndex(requestUrl, DIRECTORY_INDEX);
//     isPrecached = urlsToCacheKeys.has(requestUrl);
//   }
//
//   if (isPrecached) {
//     event.respondWith(
//       caches
//         .open(CACHE_NAME_PRECACHE)
//         .then(async (cache) => {
//           const cacheKey = urlsToCacheKeys.get(requestUrl);
//           if (!cacheKey) {
//             throw new Error(
//               `[Precache Fetch] No cache key found for ${requestUrl}`,
//             );
//           }
//           return cache.match(cacheKey).then((cachedResponse) => {
//             if (cachedResponse) {
//               return cachedResponse;
//             }
//             throw new Error(
//               "[Precache Fetch] The cached response that was expected is missing.",
//             );
//           });
//         })
//         .catch((error) => {
//           console.warn(
//             `[Precache Fetch] Couldn't serve response for "${originalRequestUrl}" from cache, falling back to network:`,
//             error,
//           );
//           return fetch(event.request);
//         }),
//     );
//   } else if (doWeCache(originalRequestUrl)) {
//     // Strategy: Stale-While-Revalidate with expiration for dynamically cached assets
//     event.respondWith(
//       caches.open(CACHE_NAME_DYNAMIC).then(async (cache) => {
//         const cachedResponse = await cache.match(originalRequestUrl);
//         const now = Date.now();
//
//         // Background revalidation promise
//         const revalidate = async () => {
//           try {
//             const networkResponse = await fetch(event.request);
//             if (networkResponse.ok && networkResponse.type === "basic") {
//               console.log(
//                 `[Dynamic Cache] Revalidating and caching: ${originalRequestUrl}`,
//               );
//               const responseToCache = networkResponse.clone();
//               const headers = new Headers(responseToCache.headers);
//               headers.set("sw-cached-date", now.toString()); // Store timestamp
//               await cache.put(
//                 originalRequestUrl,
//                 new Response(responseToCache.body, {
//                   status: responseToCache.status,
//                   statusText: responseToCache.statusText,
//                   headers: headers,
//                 }),
//               );
//             } else {
//               console.warn(
//                 `[Dynamic Cache] Not revalidating ${originalRequestUrl} due to invalid network response status: ${networkResponse.status}`,
//               );
//             }
//             return networkResponse; // Return the *fresh* network response
//           } catch (error) {
//             console.error(
//               `[Dynamic Cache] Revalidation failed for ${originalRequestUrl}:`,
//               error,
//             );
//             // If revalidation fails, and we have a cached response, return it.
//             // Otherwise, an error will propagate.
//             return cachedResponse || Promise.reject(error);
//           }
//         };
//
//         // --- Stale-While-Revalidate Logic ---
//         if (cachedResponse) {
//           const cachedDate = parseInt(
//             cachedResponse.headers.get("sw-cached-date") || "0",
//             10,
//           );
//           const isStale =
//             (now - cachedDate) / 1000 > MAX_AGE_DYNAMIC_CACHE_SECONDS;
//
//           if (isStale) {
//             console.log(
//               `[Dynamic Cache] Serving stale then revalidate for: ${originalRequestUrl}`,
//             );
//             event.waitUntil(revalidate()); // Revalidate in background
//             return cachedResponse; // Immediately return stale cached response
//           } else {
//             console.log(
//               `[Dynamic Cache] Serving fresh from cache: ${originalRequestUrl}`,
//             );
//             return cachedResponse; // Serve directly from cache if not stale
//           }
//         } else {
//           // No cached response, go to network and cache it for future
//           console.log(
//             `[Dynamic Cache] No cache, fetching and caching: ${originalRequestUrl}`,
//           );
//           return revalidate(); // Fetch from network and cache
//         }
//       }),
//     );
//   }
//   // If neither precached nor dynamically cachable, let the request go to network
// });

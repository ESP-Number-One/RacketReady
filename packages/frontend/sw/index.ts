/**
 * Hello, I am a service worker!
 *
 * This file *does not* have access to [Window], and [DOM] (main thread) --
 * so document.\* and window.\* do not work!
 *
 * Service workers typically perform background tasks, such as:
 * - Notifications
 * - Caching
 * - "Offline Mode"
 *
 * To learn more about the role of service workers in a PWA, check out:
 * https://web.dev/learn/pwa/service-workers
 */

// eslint-disable-next-line no-var -- allows us to sanely use the global SW scope.
declare var self: ServiceWorkerGlobalScope;

export {};

self.addEventListener("install", (_e) => {
  console.group("Service worker");
  console.log("Installed -- hey there!");
  console.groupEnd();
});

// self.addEventListener("fetch", (event: FetchEvent) => {
//   event.respondWith(
//     (async () => {
//       const { request: req } = event;
//       console.log("Intercepted!");
//       return fetch(req);
//     })(),
//   );
// });

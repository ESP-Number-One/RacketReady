import { type ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

/**
 *
 * ## Page Testing
 * This wrapper allows you to test page components (along with any URL parameters).
 * @param props - `route` of the page, and the `path` (optional) to use.
 * @returns The test wrapper.
 *
 * ## Props
 * * `route` - The original route for the page.
 * * `path` - The path to use when testing (optional).
 *  Use this for when you have route parameters, like `:id` in `/match/:id`.
 *
 * @example
 * ```tsx
 * // Path automatically set to "/about" -- useful since we don't
 * // care about route parameters (we don't have any!)
 * <PageTester route="/about">
 *    <AboutPage />
 * </PageTester>
 * ```
 *
 * @example
 * ```tsx
 * // Test with route parameter `:id` set to `"123"`.
 * <PageTester route="/post/:id" path="/post/123">
 *    <BlogPost />
 * </PageTester>
 * ```
 *
 */
export function PageTester({
  route,
  path = route,
  children,
}: {
  route: string;
  path?: string;
  children: ReactNode;
}) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={children} />
      </Routes>
    </MemoryRouter>
  );
}

/**
 * Makes a WebP file from a base64 string.
 * @param base64 - the base64 string.
 * @returns A WebP JavaScript {@link File}
 */
export function base64ToWebP(base64: string): File {
  const image = new Blob([
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- AP
    (globalThis as any).Buffer.from(base64, "base64") as unknown as BlobPart,
  ]);

  return new File([image], "test_image.txt", { type: "image/webp" });
}

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import css from "../styles.css?url";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "給与の学び舎 | 2026年度版・給与計算の演習" },
      {
        name: "description",
        content:
          "給与計算の知識と計算を初級・中級・上級の難易度別に学習。FSRSによる復習に対応。",
      },
    ],
    links: [
      { rel: "stylesheet", href: css },
      { rel: "icon", href: "/favicon.svg" },
    ],
  }),
  component: () => (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: () => (
    <main>
      <h1>ページが見つかりません</h1>
      <a href="/">学習ホームへ</a>
    </main>
  ),
});

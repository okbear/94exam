import type { ReactNode } from "react";
import {
  BookOpen,
  LayoutDashboard,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
} from "lucide-react";
import type { View } from "../types";
const nav = [
  { id: "home", label: "学習ホーム", icon: LayoutDashboard },
  { id: "library", label: "問題ライブラリ", icon: BookOpen },
  { id: "stats", label: "学習の記録", icon: ChartNoAxesCombined },
  { id: "settings", label: "設定", icon: Settings },
] as const;
export function StudyLayout({
  view,
  due,
  go,
  onHelp,
  children,
}: {
  view: View;
  due: number;
  go: (view: View) => void;
  onHelp: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`app-shell ${view === "study" ? "is-studying" : ""}`}>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="給与の学び舎 ホーム">
          <span className="brand-mark">
            <BookOpen size={23} />
          </span>
          <span>
            給与の学び舎<small>2026年度版</small>
          </span>
        </a>
        <div className="course-label">給与計算の演習</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              className={
                view === n.id || (view === "study" && n.id === "home")
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => go(n.id)}
            >
              <n.icon size={19} />
              {n.label}
              {n.id === "home" && due > 0 && (
                <span className="nav-count">{due}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="help-link" onClick={() => onHelp()}>
          <CircleHelp size={17} />
          学び舎について
          <ArrowUpRight size={15} />
        </button>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="edition-badge">2026年度版</span>{" "}
            <ChevronRight size={13} />{" "}
            <span>
              {view === "study"
                ? "演習問題"
                : nav.find((n) => n.id === view)?.label}
            </span>
          </div>
          <div className="top-right">
            <span className="local-badge">
              <span />
              この端末に自動保存
            </span>
          </div>
        </header>
        <main>
          {children}
          <footer>
            <span>給与の学び舎</span>
            <span>2026年度版</span>
            <small>2026年度版 · 給与計算の学習サポート</small>
          </footer>
        </main>
      </div>
    </div>
  );
}

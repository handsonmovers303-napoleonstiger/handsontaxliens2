import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, CalendarDays, Library, Map } from "lucide-react";
import type { ReactNode } from "react";
import { useSaved } from "@/lib/saved";

const NAV = [
  { to: "/", label: "Atlas", icon: Map },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/method", label: "Sources", icon: Library },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const saved = useSaved((state) => state.ids.length);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="shrink-0 border-b border-line bg-bg">
        <div className="flex flex-col gap-1 px-3 py-2 sm:px-5 lg:flex-row lg:items-center lg:gap-4 lg:py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-gold font-display text-xl text-gold-fg">
              H
            </span>
            <span>
              <span className="block font-display text-lg leading-none tracking-tight whitespace-nowrap">
                Hands On
              </span>
              <span className="block font-mono text-xs tracking-widest text-muted">TAX LIENS</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1 overflow-x-auto lg:ml-auto">
            {NAV.map((item) => {
              const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  search={item.to === "/" ? {} : undefined}
                  aria-current={on ? "page" : undefined}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    on ? "text-fg" : "text-muted"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                  {item.to === "/saved" && saved > 0 ? (
                    <span className="font-mono text-xs text-gold">{saved}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <p className="border-t border-line px-4 py-2 font-mono text-xs text-subtle sm:px-6">
          Research file for county tax sales. Not financial, legal, or tax advice. A date is only as
          current as the source named next to it.
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

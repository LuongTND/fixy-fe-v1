"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LegalLayout({
  title,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
      {/* Header */}
      <div className="border-b border-[var(--color-border-light)] pb-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-2">
          Pháp lý
        </p>
        <h1 className="font-h1 text-[var(--color-on-background)] m-0">
          {title}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 m-0">
          Cập nhật lần cuối: {lastUpdated}
        </p>
      </div>

      <div className="flex gap-10">
        {/* Sticky TOC — desktop only */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <nav className="sticky top-[90px]">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Mục lục
            </p>
            <ul className="list-none m-0 p-0 flex flex-col gap-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left text-sm py-1.5 px-3 rounded transition-colors duration-200 border-none bg-transparent cursor-pointer ${
                      activeId === s.id
                        ? "text-[var(--color-primary)] font-semibold bg-[var(--color-primary-light)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0 pb-16">{children}</article>
      </div>
    </div>
  );
}

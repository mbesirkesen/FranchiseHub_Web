"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandAction,
  filterCommandActions,
  getCommandActions,
  parseSpotlightQuery,
} from "@/lib/command-palette-actions";
import { getUserRole } from "@/lib/auth";
import { UserRole } from "@/lib/types";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, [open]);

  const actions = useMemo(() => getCommandActions(role), [role]);
  const filtered = useMemo(() => filterCommandActions(actions, query), [actions, query]);

  const spotlightHref = useMemo(() => {
    if (role !== "buyer" || query.trim().length < 8) return null;
    return parseSpotlightQuery(query);
  }, [role, query]);

  const allResults: CommandAction[] = useMemo(() => {
    if (spotlightHref) {
      return [
        {
          id: "spotlight-nl",
          label: `"${query.trim()}" için marka ara`,
          hint: "Doğal dil araması",
          href: spotlightHref,
          group: "Spotlight",
        },
        ...filtered.filter((f) => f.id !== "spotlight-nl"),
      ];
    }
    return filtered;
  }, [filtered, spotlightHref, query]);

  const run = useCallback(
    (action: CommandAction) => {
      if (action.href) {
        router.push(action.href);
      }
      setOpen(false);
      setQuery("");
    },
    [router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allResults.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && allResults[activeIndex]) {
        e.preventDefault();
        run(allResults[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, allResults, activeIndex, run]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <>
      <button type="button" className="cmd-k-trigger" onClick={() => setOpen(true)} aria-label="Komut paleti">
        <span>Ara</span>
        <kbd>⌘K</kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="cmd-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="cmd-palette"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Komut paleti"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sayfa ara veya '500 bin TL altı gıda markaları' yaz…"
                className="cmd-palette-input"
              />
              <ul className="cmd-palette-list">
                {allResults.length === 0 ? (
                  <li className="cmd-palette-empty">Sonuç yok</li>
                ) : (
                  allResults.map((action, i) => (
                    <motion.li
                      key={action.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <button
                        type="button"
                        className={i === activeIndex ? "cmd-palette-item cmd-palette-item-active" : "cmd-palette-item"}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => run(action)}
                      >
                        <span className="cmd-palette-item-label">{action.label}</span>
                        <span className="cmd-palette-item-meta">{action.group}</span>
                      </button>
                    </motion.li>
                  ))
                )}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

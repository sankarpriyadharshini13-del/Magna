"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { ChevronIcon } from "@/components/ui/Icons";

const MAX_SUGGESTIONS = 8;

const field =
  "w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 pr-10 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15";

const invalidField = "border-red-500 bg-red-50/60 focus:border-red-500 focus:ring-red-500/15";

/**
 * Text input with a suggestion list — used for Country, State and City on the enquiry forms.
 * Visitors can pick from the list or type their own value (nothing here is locked), and the
 * list filters as they type. Keyboard: ↑ ↓ to move, Enter to pick, Esc to close.
 */
export default function Combobox({
  id,
  value,
  options,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  invalid = false,
  loading = false,
  inputMode,
  maxLength,
}: {
  id: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  /** True while the options are being fetched. */
  loading?: boolean;
  inputMode?: "text" | "numeric";
  maxLength?: number;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    const pool = query ? options.filter((option) => option.toLowerCase().includes(query)) : options;
    return pool.slice(0, MAX_SUGGESTIONS);
  }, [options, value]);

  useEffect(() => {
    setActive(-1);
  }, [value, open]);

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(current + 1, matches.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && open && active >= 0 && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-option-${active}` : undefined}
        aria-invalid={invalid || undefined}
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
        className={`${field} ${invalid ? invalidField : ""}`}
      />

      <ChevronIcon width={16} height={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45" />

      {open && (loading || matches.length > 0) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-forest/10 bg-white py-1 shadow-lift"
        >
          {loading && <li className="px-4 py-2 text-xs font-medium text-ink/50">Looking up options…</li>}
          {matches.map((option, index) => (
            <li key={option} id={`${listId}-option-${index}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  index === active ? "bg-leaf/10 font-semibold text-forest" : "text-ink/80 hover:bg-sand/60 hover:text-forest"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

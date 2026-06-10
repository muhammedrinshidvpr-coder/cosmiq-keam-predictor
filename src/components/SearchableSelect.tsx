"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allOptionLabel?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  allOptionLabel = "All",
  disabled = false,
  placeholder,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = value || (placeholder ?? allOptionLabel);
  const hasValue = Boolean(value);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: "100%",
          height: "3rem",
          paddingLeft: "1rem",
          paddingRight: "2.5rem",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          fontWeight: hasValue ? 600 : 500,
          color: hasValue ? "#2b2c3d" : "rgba(73,77,95,0.45)",
          background: disabled ? "rgba(244,244,245,0.8)" : "rgba(255,255,255,0.78)",
          border: `1.5px solid ${open ? "#8458B3" : "rgba(160,210,235,0.5)"}`,
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          boxSizing: "border-box",
          display: "block",
          position: "relative",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          boxShadow: open
            ? "0 0 0 3px rgba(132,88,179,0.14)"
            : "0 1px 4px rgba(132,88,179,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
          opacity: disabled ? 0.55 : 1,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <span
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "1.25rem",
          }}
        >
          {displayLabel}
        </span>
        <ChevronDown
          style={{
            position: "absolute",
            right: "0.875rem",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
            width: "1rem",
            height: "1rem",
            color: "rgba(132,88,179,0.5)",
            transition: "transform 0.2s",
            pointerEvents: "none",
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.375rem)",
            left: 0,
            right: 0,
            zIndex: 200,
            borderRadius: "0.875rem",
            background: "rgba(255,255,255,0.98)",
            border: "1.5px solid rgba(160,210,235,0.5)",
            boxShadow:
              "0 20px 60px rgba(132,88,179,0.14), 0 4px 16px rgba(0,0,0,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            overflow: "hidden",
          }}
        >
          {/* Search row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 0.875rem",
              borderBottom: "1px solid rgba(160,210,235,0.2)",
            }}
          >
            <Search
              style={{
                width: "0.875rem",
                height: "0.875rem",
                color: "rgba(132,88,179,0.45)",
                flexShrink: 0,
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.8125rem",
                color: "#2b2c3d",
                background: "transparent",
                fontWeight: 500,
              }}
            />
          </div>

          {/* Options list */}
          <div style={{ maxHeight: "20rem", overflowY: "auto" }}>
            <OptionRow
              label={allOptionLabel}
              selected={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            />
            {filtered.map((opt) => (
              <OptionRow
                key={opt}
                label={opt}
                selected={value === opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: "1.25rem",
                  textAlign: "center",
                  fontSize: "0.8125rem",
                  color: "rgba(73,77,95,0.45)",
                }}
              >
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(160,210,235,0.1)";
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
      }}
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        textAlign: "left",
        background: selected ? "rgba(132,88,179,0.07)" : "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.875rem",
        fontWeight: selected ? 700 : 400,
        color: selected ? "#8458B3" : "#2b2c3d",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "calc(100% - 1.5rem)",
        }}
      >
        {label}
      </span>
      {selected && (
        <Check
          style={{
            width: "0.875rem",
            height: "0.875rem",
            color: "#8458B3",
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
}

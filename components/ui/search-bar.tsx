// Search bar with country/crime autocomplete.
"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Country } from "@/lib/types";

interface SearchBarProps {
  countries: Country[];
  onSelectCountry: (countryId: string) => void;
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({ countries, onSelectCountry, onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? countries.filter(
        (c) =>
          c.countryName.toLowerCase().includes(query.toLowerCase()) ||
          c.primaryAct.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(countryId: string) {
    onSelectCountry(countryId);
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && query.length > 0) {
      if (filtered.length > 0) {
        handleSelect(filtered[0].countryId);
      } else {
        onSearch(query);
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search country or law..."
          className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-1.5 w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
        >
          {filtered.map((country) => (
            <button
              key={country.countryId}
              onClick={() => handleSelect(country.countryId)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-800/60 transition-colors text-left"
            >
              <span className="text-lg">{country.flagEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-200 font-medium truncate">
                  {country.countryName}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">{country.primaryAct}</div>
              </div>
              <div
                className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: country.colorCode }}
              >
                {country.overallStrictnessScore.toFixed(1)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

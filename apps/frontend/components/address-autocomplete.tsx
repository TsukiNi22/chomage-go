"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchPlaces, type Place } from "@/lib/geocoding";

type Props = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onSelect?: (place: Place) => void;
    placeholder?: string;
    required?: boolean;
    name?: string;
};

/**
 * Champ d'adresse avec suggestions de la Base Adresse Nationale.
 * Même comportement que la recherche de lieu de la carte : ouverture au focus,
 * navigation au clavier et fermeture au clic extérieur.
 */
export default function AddressAutocomplete(props: Props) {
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const boxRef = useRef<HTMLDivElement>(null);
    const lastSelectedRef = useRef<string | null>(null);

    const value = props.value;
    const listboxId = props.id + "-suggestions";

    useEffect(
        function () {
            const query = value.trim();

            if (query.length < 3 || query === lastSelectedRef.current) {
                setSuggestions([]);
                setOpen(false);
                return;
            }

            let cancelled = false;

            const timer = setTimeout(function () {
                searchPlaces(query, 5).then(function (found) {
                    if (cancelled) {
                        return;
                    }
                    setSuggestions(found);
                    setHighlighted(-1);
                    setOpen(found.length > 0);
                });
            }, 300);

            return function () {
                cancelled = true;
                clearTimeout(timer);
            };
        },
        [value],
    );

    useEffect(function () {
        function handleClickOutside(event: MouseEvent) {
            if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return function () {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function select(place: Place) {
        lastSelectedRef.current = place.label;
        props.onChange(place.label);
        if (props.onSelect) {
            props.onSelect(place);
        }
        setOpen(false);
        setSuggestions([]);
        setHighlighted(-1);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (!open || suggestions.length === 0) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted(function (previous) {
                return (previous + 1) % suggestions.length;
            });
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted(function (previous) {
                return (previous - 1 + suggestions.length) % suggestions.length;
            });
            return;
        }

        if (event.key === "Enter" && highlighted >= 0) {
            event.preventDefault();
            select(suggestions[highlighted]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
            setHighlighted(-1);
        }
    }

    function handleBlur() {
        requestAnimationFrame(function () {
            if (boxRef.current && !boxRef.current.contains(document.activeElement)) {
                setOpen(false);
            }
        });
    }

    let activeDescendant: string | undefined = undefined;
    if (highlighted >= 0) {
        activeDescendant = props.id + "-option-" + highlighted;
    }

    let list = null;
    if (open && suggestions.length > 0) {
        list = (
            <ul
                id={listboxId}
                role="listbox"
                aria-label="Suggestions d'adresses"
                className="absolute z-20 mt-1 w-full border border-border bg-background shadow-md"
            >
                {suggestions.map(function (suggestion, index) {
                    let optionStyle = "hover:bg-accent";
                    if (index === highlighted) {
                        optionStyle = "bg-accent text-accent-foreground";
                    }

                    return (
                        <li
                            key={suggestion.label + index}
                            id={props.id + "-option-" + index}
                            role="option"
                            aria-selected={index === highlighted}
                        >
                            <button
                                type="button"
                                onClick={function () {
                                    select(suggestion);
                                }}
                                onMouseEnter={function () {
                                    setHighlighted(index);
                                }}
                                className={cn(
                                    "w-full px-3 py-2 text-left font-heading text-sm",
                                    optionStyle,
                                )}
                            >
                                {suggestion.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div ref={boxRef} className="relative" onBlur={handleBlur}>
            <Input
                id={props.id}
                name={props.name}
                value={value}
                placeholder={props.placeholder}
                required={props.required}
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeDescendant}
                onChange={function (event) {
                    props.onChange(event.target.value);
                }}
                onFocus={function () {
                    if (suggestions.length > 0) {
                        setOpen(true);
                    }
                }}
                onKeyDown={handleKeyDown}
            />
            {list}
        </div>
    );
}

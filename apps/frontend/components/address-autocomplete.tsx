"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type Place } from "@/lib/geocoding";

type Props = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function AddressAutocomplete(props: Props) {
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [touched, setTouched] = useState(false);

    const value = props.value;

    useEffect(
        function () {
            if (!touched || value.trim().length < 3) {
                setSuggestions([]);
                return;
            }

            let cancelled = false;

            const timer = setTimeout(function () {
                searchPlaces(value, 5).then(function (found) {
                    if (cancelled) {
                        return;
                    }
                    setSuggestions(found);
                    setHighlighted(-1);
                    if (found.length > 0) {
                        setOpen(true);
                    }
                });
            }, 300);

            return function () {
                cancelled = true;
                clearTimeout(timer);
            };
        },
        [value, touched],
    );

    function select(place: Place) {
        props.onChange(place.label);
        setOpen(false);
        setSuggestions([]);
        setTouched(false);
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
        }
    }

    let list = null;
    if (open && suggestions.length > 0) {
        list = (
            <ul
                id={props.id + "-suggestions"}
                role="listbox"
                className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-md"
            >
                {suggestions.map(function (suggestion, index) {
                    let itemClass =
                        "cursor-pointer px-3 py-2 text-sm hover:bg-accent";
                    if (index === highlighted) {
                        itemClass = "cursor-pointer bg-accent px-3 py-2 text-sm";
                    }

                    return (
                        <li
                            key={suggestion.label + index}
                            role="option"
                            aria-selected={index === highlighted}
                            onMouseDown={function (event) {
                                event.preventDefault();
                                select(suggestion);
                            }}
                            className={itemClass}
                        >
                            {suggestion.label}
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="relative">
            <Input
                id={props.id}
                value={value}
                placeholder={props.placeholder}
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-controls={props.id + "-suggestions"}
                aria-autocomplete="list"
                onChange={function (event) {
                    setTouched(true);
                    props.onChange(event.target.value);
                }}
                onKeyDown={handleKeyDown}
                onBlur={function () {
                    setOpen(false);
                }}
            />
            {list}
        </div>
    );
}

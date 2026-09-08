"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { distanceInKm, formatDistance } from "@/lib/distance";
import { normalize, searchPlaces, type Place } from "@/lib/geocoding";
import { employeeRangeLabel } from "@/lib/api";
import { locatedCompanies, type CompanyPin } from "@/lib/companies";
import { cn } from "@/lib/utils";

const Map = dynamic(
    function () {
        return import("@/components/map");
    },
    {
        ssr: false,
        loading: function () {
            return <Skeleton className="h-full w-full rounded-none" />;
        },
    },
);

const RADIUS_OPTIONS = [5, 10, 25, 50];
const FRANCE_LAT = 46.7;
const FRANCE_LON = 2.4;
const FRANCE_ZOOM = 6;

type Props = {
    companies: CompanyPin[];
};

export default function CompanyMapExplorer(props: Props) {
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [place, setPlace] = useState<Place | null>(null);
    const [radius, setRadius] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const locationBoxRef = useRef<HTMLDivElement>(null);
    const lastSelectedLabelRef = useRef<string | null>(null);

    useEffect(
        function () {
            const query = location.trim();

            if (query.length < 2 || query === lastSelectedLabelRef.current) {
                setSuggestions([]);
                setSuggestionsOpen(false);
                return;
            }

            let cancelled = false;

            const timer = setTimeout(function () {
                searchPlaces(query, 5).then(function (found) {
                    if (cancelled) {
                        return;
                    }
                    setSuggestions(found);
                    setSuggestionsOpen(found.length > 0);
                    setHighlightedIndex(-1);
                });
            }, 400);

            return function () {
                cancelled = true;
                clearTimeout(timer);
            };
        },
        [location],
    );

    useEffect(function () {
        function handleClickOutside(event: MouseEvent) {
            if (
                locationBoxRef.current &&
                !locationBoxRef.current.contains(event.target as Node)
            ) {
                setSuggestionsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return function () {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    let origin: { lat: number; lon: number } | null = null;
    if (place !== null) {
        origin = { lat: place.lat, lon: place.lon };
    }

    let searchRadius = radius;
    if (searchRadius === null && place !== null) {
        searchRadius = 30;
    }

    const results = props.companies.filter(function (company) {
        if (origin !== null && searchRadius !== null) {
            if (!company.located) {
                return false;
            }
            const km = distanceInKm(origin.lat, origin.lon, company.lat, company.lon);
            if (km > searchRadius) {
                return false;
            }
        }

        if (origin === null && location !== "") {
            const wanted = normalize(location);
            const field = normalize(company.city + " " + company.postalCode);
            if (!field.includes(wanted)) {
                return false;
            }
        }

        const text = normalize(search);
        if (text === "") {
            return true;
        }

        const target = normalize(
            company.name + " " + company.activity + " " + company.siret,
        );

        return target.includes(text);
    });

    if (origin !== null) {
        results.sort(function (a, b) {
            if (!a.located) {
                return 1;
            }
            if (!b.located) {
                return -1;
            }
            const first = distanceInKm(origin.lat, origin.lon, a.lat, a.lon);
            const second = distanceInKm(origin.lat, origin.lon, b.lat, b.lon);
            return first - second;
        });
    }

    const mappable = locatedCompanies(results);

    const points = mappable.map(function (company) {
        return {
            id: company.id,
            lat: company.lat,
            lon: company.lon,
            title: company.name,
            subtitle: company.activity,
            detail: company.jobsCount + " offre(s) · " + company.city,
            label:
                company.name + ", " + company.activity + ", " + company.city +
                ". Ouvrir la fiche de l'entreprise.",
        };
    });

    const selected = results.find(function (company) {
        return company.id === selectedId;
    });

    let targetLat = FRANCE_LAT;
    let targetLon = FRANCE_LON;
    let targetZoom = FRANCE_ZOOM;

    if (selected !== undefined && selected.located) {
        targetLat = selected.lat;
        targetLon = selected.lon;
        targetZoom = 14;
    } else if (place !== null) {
        targetLat = place.lat;
        targetLon = place.lon;
        targetZoom = 11;
    }

    function selectPlace(chosen: Place) {
        lastSelectedLabelRef.current = chosen.label;
        setLocation(chosen.label);
        setPlace(chosen);
        setSuggestions([]);
        setSuggestionsOpen(false);
        setHighlightedIndex(-1);
        setSelectedId(null);
    }

    function handleLocationKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (!suggestionsOpen || suggestions.length === 0) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex(function (previous) {
                return (previous + 1) % suggestions.length;
            });
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex(function (previous) {
                return (previous - 1 + suggestions.length) % suggestions.length;
            });
            return;
        }

        if (event.key === "Enter" && highlightedIndex >= 0) {
            event.preventDefault();
            selectPlace(suggestions[highlightedIndex]);
            return;
        }

        if (event.key === "Escape") {
            setSuggestionsOpen(false);
            setHighlightedIndex(-1);
        }
    }

    function toggleRadius(value: number) {
        if (radius === value) {
            setRadius(null);
        } else {
            setRadius(value);
        }
    }

    function resetFilters() {
        setSearch("");
        setLocation("");
        setPlace(null);
        setRadius(null);
        setSuggestions([]);
        setSuggestionsOpen(false);
        setSelectedId(null);
        lastSelectedLabelRef.current = null;
    }

    let resetButton = null;
    if (search !== "" || location !== "" || radius !== null) {
        resetButton = (
            <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 border border-border bg-background px-3 py-1.5 font-heading text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
                <X className="h-3 w-3" />
                Tout effacer
            </button>
        );
    }

    let radiusRow = null;
    if (origin !== null) {
        radiusRow = (
            <div
                role="group"
                aria-label="Rayon de recherche"
                className="flex flex-wrap items-center gap-2"
            >
                <span
                    aria-hidden="true"
                    className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                    Rayon
                </span>
                {RADIUS_OPTIONS.map(function (value) {
                    let style = "border-border bg-background hover:border-primary";
                    if (searchRadius === value) {
                        style = "border-primary bg-accent text-accent-foreground";
                    }

                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={function () {
                                toggleRadius(value);
                            }}
                            aria-pressed={searchRadius === value}
                            className={cn(
                                "border px-3 py-1.5 font-heading text-xs font-medium transition-colors",
                                style,
                            )}
                        >
                            {value} km
                        </button>
                    );
                })}
            </div>
        );
    }

    let listBody = (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-16 text-center">
            <p className="font-heading text-base font-semibold text-primary">
                Aucune entreprise dans ce secteur
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
                Élargissez le périmètre de recherche ou essayez une autre commune.
            </p>
        </div>
    );

    if (results.length > 0) {
        listBody = (
            <div>
                <p className="border-b border-border bg-muted px-6 py-3 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {results.length} entreprise(s)
                </p>

                <ul>
                    {results.map(function (company) {
                        let distanceBadge = null;
                        if (origin !== null && company.located) {
                            const km = distanceInKm(
                                origin.lat,
                                origin.lon,
                                company.lat,
                                company.lon,
                            );
                            distanceBadge = (
                                <span className="font-heading font-semibold text-action-text">
                                    {formatDistance(km)}
                                </span>
                            );
                        }

                        let rowBackground = "bg-background hover:bg-muted";
                        if (company.id === selectedId) {
                            rowBackground = "bg-accent";
                        }

                        let place = "Adresse non renseignée";
                        if (company.city !== "") {
                            place = company.city + " (" + company.postalCode + ")";
                        }

                        return (
                            <li key={company.id}>
                                <div
                                    className={cn(
                                        "border-b border-border px-6 py-5",
                                        rowBackground,
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={function () {
                                            setSelectedId(company.id);
                                        }}
                                        aria-current={company.id === selectedId}
                                        className="w-full text-left"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-heading text-base font-semibold text-primary">
                                                {company.name}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 font-heading"
                                            >
                                                {company.jobsCount} offre(s)
                                            </Badge>
                                        </div>

                                        <p className="mt-1 text-sm">{company.activity}</p>

                                        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                                            <span>{place}</span>
                                            {distanceBadge}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {employeeRangeLabel(company.employeeRange)}
                                        </p>
                                    </button>

                                    <Link
                                        href={"/entreprises/" + company.id}
                                        className="mt-2 inline-block font-heading text-sm font-semibold text-primary underline underline-offset-4 hover:no-underline"
                                    >
                                        Consulter la fiche
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background">
            <div
                role="search"
                aria-label="Rechercher une entreprise"
                className="flex flex-col gap-3 border-b border-border bg-background px-6 py-4"
            >
                <h1 className="font-heading text-sm font-bold uppercase tracking-[0.08em] text-primary">
                    Carte des entreprises
                </h1>

                <div className="flex flex-col gap-3 lg:flex-row">
                    <Input
                        value={search}
                        onChange={function (event) {
                            setSearch(event.target.value);
                        }}
                        placeholder="Nom, activité ou SIRET…"
                        className="lg:flex-1"
                        aria-label="Rechercher une entreprise"
                    />

                    <div ref={locationBoxRef} className="relative lg:w-72">
                        <Input
                            value={location}
                            onChange={function (event) {
                                setLocation(event.target.value);
                            }}
                            onKeyDown={handleLocationKeyDown}
                            onFocus={function () {
                                if (suggestions.length > 0) {
                                    setSuggestionsOpen(true);
                                }
                            }}
                            placeholder="Adresse ou code postal…"
                            aria-label="Rechercher une commune ou un code postal"
                            role="combobox"
                            aria-expanded={suggestionsOpen}
                            aria-controls="company-location-listbox"
                            aria-autocomplete="list"
                            aria-activedescendant={
                                highlightedIndex >= 0
                                    ? `company-location-option-${highlightedIndex}`
                                    : undefined
                            }
                        />

                        {suggestionsOpen && suggestions.length > 0 && (
                            <ul
                                id="company-location-listbox"
                                role="listbox"
                                aria-label="Suggestions de communes"
                                className="absolute z-20 mt-1 w-full border border-border bg-background shadow-md"
                            >
                                {suggestions.map(function (suggestion, index) {
                                    let optionStyle = "hover:bg-accent";
                                    if (index === highlightedIndex) {
                                        optionStyle = "bg-accent text-accent-foreground";
                                    }

                                    return (
                                        <li
                                            key={index}
                                            id={`company-location-option-${index}`}
                                            role="option"
                                            aria-selected={index === highlightedIndex}
                                        >
                                            <button
                                                type="button"
                                                onClick={function () {
                                                    selectPlace(suggestion);
                                                }}
                                                onMouseEnter={function () {
                                                    setHighlightedIndex(index);
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
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {radiusRow}
                    {resetButton}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                <aside
                    aria-label="Liste des entreprises"
                    className="order-2 h-full w-full overflow-y-auto border-border lg:order-1 lg:w-[26rem] lg:border-r"
                >
                    {listBody}
                </aside>

                <div className="isolate order-1 h-72 w-full lg:order-2 lg:h-full lg:flex-1">
                    <Map
                        points={points}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        targetLat={targetLat}
                        targetLon={targetLon}
                        targetZoom={targetZoom}
                    />
                </div>
            </div>
        </div>
    );
}

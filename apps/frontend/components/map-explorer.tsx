"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Crosshair, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import JobDetails from "@/components/job-details";
import JobList from "@/components/job-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { distanceInKm } from "@/lib/distance";
import { normalize, searchPlaces } from "@/lib/geocoding";
import type { Place } from "@/lib/geocoding";
import { jobs, locatedJobs } from "@/lib/jobs";
import type { Job } from "@/lib/jobs";
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

const DISPLAY_LIMIT = 120;
const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage"];
const RADIUS_OPTIONS = [5, 10, 25, 50];
const FRANCE_LAT = 46.7;
const FRANCE_LON = 2.4;
const FRANCE_ZOOM = 6;

type Position = { lat: number; lon: number };

type ExplorerProps = {
    embedded?: boolean;
};

export default function MapExplorer(props: ExplorerProps) {
    const { data: session } = authClient.useSession();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [contract, setContract] = useState<string | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [radius, setRadius] = useState<number | null>(null);
    const [geoMessage, setGeoMessage] = useState<string | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [place, setPlace] = useState<Place | null>(null);
    const [placeLoading, setPlaceLoading] = useState(false);
    const [disablingGeo, setDisablingGeo] = useState(false);
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const locationBoxRef = useRef<HTMLDivElement>(null);

    useEffect(
        function () {
            const query = location.trim();

            if (query.length < 2 || query === lastSelectedLabelRef.current) {
                setSuggestions([]);
                setSuggestionsOpen(false);
                setPlaceLoading(false);
                return;
            }

            let cancelled = false;
            setPlaceLoading(true);

            const timer = setTimeout(function () {
                searchPlaces(query, 5).then(function (found) {
                    if (cancelled) {
                        return;
                    }
                    setSuggestions(found);
                    setSuggestionsOpen(found.length > 0);
                    setHighlightedIndex(-1);
                    setPlaceLoading(false);
                });
            }, 400);

            return function () {
                cancelled = true;
                clearTimeout(timer);
            };
        },
        [location],
    );

    let origin: Position | null = null;
    if (place !== null) {
        origin = { lat: place.lat, lon: place.lon };
    } else if (position !== null) {
        origin = position;
    }

    let searchRadius = radius;
    if (searchRadius === null && place !== null) {
        searchRadius = 30;
    }

    const results = jobs.filter(function (job) {
        if (contract !== null && job.contract !== contract) {
            return false;
        }

        if (origin !== null && searchRadius !== null) {
            if (job.needsLocationCheck) {
                return false;
            }
            const km = distanceInKm(origin.lat, origin.lon, job.lat, job.lon);
            if (km > searchRadius) {
                return false;
            }
        }

        if (origin === null && location !== "") {
            const wanted = normalize(location);
            const field = normalize(job.city + " " + job.postalCode);
            if (!field.includes(wanted)) {
                return false;
            }
        }

        const text = normalize(search);
        if (text === "") {
            return true;
        }

        const target = normalize(
            job.title + " " + job.company + " " + job.sector + " " + job.contract,
        );

        return target.includes(text);
    });

    if (origin !== null) {
        results.sort(function (a, b) {
            if (a.needsLocationCheck) {
                return 1;
            }
            if (b.needsLocationCheck) {
                return -1;
            }
            const first = distanceInKm(origin.lat, origin.lon, a.lat, a.lon);
            const second = distanceInKm(origin.lat, origin.lon, b.lat, b.lon);
            return first - second;
        });
    }

    const visibleJobs = results.slice(0, DISPLAY_LIMIT);
    const mappableJobs = locatedJobs(visibleJobs);
    const lastSelectedLabelRef = useRef<string | null>(null);

    let targetLat = FRANCE_LAT;
    let targetLon = FRANCE_LON;
    let targetZoom = FRANCE_ZOOM;

    if (selectedJob !== null && selectedJob.needsLocationCheck === false) {
        targetLat = selectedJob.lat;
        targetLon = selectedJob.lon;
        targetZoom = 14;
    } else if (place !== null) {
        targetLat = place.lat;
        targetLon = place.lon;
        targetZoom = 11;
    } else if (position !== null) {
        targetLat = position.lat;
        targetLon = position.lon;
        targetZoom = 12;
    } else if (search !== "" && mappableJobs.length > 0) {
        targetLat = mappableJobs[0].lat;
        targetLon = mappableJobs[0].lon;
        targetZoom = 11;
    }

    function selectJob(job: Job) {
        setSelectedJob(job);
        setDetailsOpen(true);
    }

    function closeDetails() {
        setDetailsOpen(false);
    }

    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    function handleLocation(event: React.ChangeEvent<HTMLInputElement>) {
        setLocation(event.target.value);
    }

    function selectPlace(selected: Place) {
        lastSelectedLabelRef.current = selected.label;
        setLocation(selected.label);
        setPlace(selected);
        setSuggestions([]);
        setSuggestionsOpen(false);
        setHighlightedIndex(-1);
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

        if (event.key === "Enter") {
            if (highlightedIndex >= 0) {
                event.preventDefault();
                selectPlace(suggestions[highlightedIndex]);
            }
            return;
        }

        if (event.key === "Escape") {
            setSuggestionsOpen(false);
            setHighlightedIndex(-1);
        }
    }

    function toggleContract(value: string) {
        if (contract === value) {
            setContract(null);
        } else {
            setContract(value);
        }
    }

    function toggleRadius(value: number) {
        if (radius === value) {
            setRadius(null);
        } else {
            setRadius(value);
        }
    }

    let allowed = false;
    if (session && session.user.localisation === true) {
        allowed = true;
    }

    useEffect(
        function () {
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
        },
        [],
    );

    function handleLocationBoxBlur() {
        requestAnimationFrame(function () {
            if (
                locationBoxRef.current &&
                !locationBoxRef.current.contains(document.activeElement)
            ) {
                setSuggestionsOpen(false);
            }
        });
    }

    useEffect(
        function () {
            if (!allowed) {
                setPosition(null);
                setRadius(null);
                setGeoLoading(false);
                setGeoMessage(null);
                return;
            }

            if (typeof navigator === "undefined" || !navigator.geolocation) {
                setGeoMessage(
                    "Votre navigateur ne propose pas la géolocalisation. La recherche par commune reste disponible.",
                );
                return;
            }

            let cancelled = false;
            setGeoLoading(true);
            setGeoMessage("Localisation en cours…");

            navigator.geolocation.getCurrentPosition(
                function (result) {
                    if (cancelled) {
                        return;
                    }
                    setPosition({
                        lat: result.coords.latitude,
                        lon: result.coords.longitude,
                    });
                    setRadius(50);
                    setGeoLoading(false);
                    setGeoMessage(
                        "Position calculée sur votre appareil. Elle n'est ni transmise ni enregistrée sur nos serveurs.",
                    );
                },
                function (error) {
                    if (cancelled) {
                        return;
                    }
                    setGeoLoading(false);

                    if (error.code === error.PERMISSION_DENIED) {
                        setGeoMessage(
                            "Le navigateur a refusé la localisation. Autorisez-la dans ses réglages, ou cherchez par commune.",
                        );
                        return;
                    }

                    if (error.code === error.POSITION_UNAVAILABLE) {
                        setGeoMessage(
                            "Position introuvable. Votre appareil n'a pas pu la déterminer. Cherchez par commune ou par code postal.",
                        );
                        return;
                    }

                    if (error.code === error.TIMEOUT) {
                        setGeoMessage(
                            "La localisation a pris trop de temps. Cherchez par commune, ou rechargez la page.",
                        );
                        return;
                    }

                    setGeoMessage(
                        "La géolocalisation est indisponible. Cherchez par commune ou par code postal.",
                    );
                },
                { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
            );

            return function () {
                cancelled = true;
            };
        },
        [allowed],
    );

    async function enableGeolocation() {
        setDisablingGeo(true);
        await authClient.updateUser({ localisation: true });
        setDisablingGeo(false);
    }

    async function disableGeolocation() {
        setDisablingGeo(true);
        await authClient.updateUser({ localisation: false });
        setDisablingGeo(false);
    }

    function resetFilters() {
        setSearch("");
        setLocation("");
        setContract(null);
        setRadius(null);
        setPlace(null);
        setSuggestions([]);
        setSuggestionsOpen(false);
        lastSelectedLabelRef.current = null;
    }

    let geoToggle: React.ReactNode;

    if (!session) {
        geoToggle = (
            <Link
                href="/profil"
                className="flex items-center gap-1.5 border border-border bg-background px-3.5 py-1.5 font-heading text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
                <Crosshair className="h-3.5 w-3.5" />
                Connectez-vous pour activer la localisation
            </Link>
        );
    } else if (geoLoading) {
        geoToggle = (
            <span className="flex items-center gap-1.5 border border-border bg-background px-3.5 py-1.5 font-heading text-xs font-medium text-muted-foreground">
                <Crosshair className="h-3.5 w-3.5" />
                Localisation en cours…
            </span>
        );
    } else if (allowed) {
        geoToggle = (
            <button
                type="button"
                onClick={disableGeolocation}
                disabled={disablingGeo}
                aria-pressed={true}
                className="flex items-center gap-1.5 border border-primary bg-accent px-3.5 py-1.5 font-heading text-xs font-medium text-accent-foreground transition-opacity hover:opacity-80 disabled:opacity-50"
            >
                <Crosshair className="h-3.5 w-3.5" />
                {position !== null ? "Offres triées par distance" : "Localisation activée"}
            </button>
        );
    } else {
        geoToggle = (
            <button
                type="button"
                onClick={enableGeolocation}
                disabled={disablingGeo}
                aria-pressed={false}
                className="flex items-center gap-1.5 border border-border bg-background px-3.5 py-1.5 font-heading text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
                <Crosshair className="h-3.5 w-3.5" />
                Géolocalisation désactivée
            </button>
        );
    }

    let geoBlock = null;
    if (geoMessage !== null) {
        geoBlock = (
            <p aria-live="polite" className="text-xs text-muted-foreground">
                {geoMessage}
            </p>
        );
    }

    let userLat = null;
    let userLon = null;
    if (origin !== null) {
        userLat = origin.lat;
        userLon = origin.lon;
    }

    let placeBlock = null;
    if (placeLoading) {
        placeBlock = (
            <p className="text-xs text-muted-foreground">Recherche du lieu…</p>
        );
    } else if (place !== null) {
        placeBlock = (
            <p className="text-xs text-muted-foreground">
                Autour de{" "}
                <span className="font-heading font-semibold text-primary">
                    {place.label}
                </span>
                . Les offres sont triées par distance.
            </p>
        );
    } else if (location.trim().length >= 2) {
        placeBlock = (
            <p className="text-xs text-muted-foreground">
                Lieu introuvable. Vérifiez l&apos;orthographe de la commune ou du code
                postal.
            </p>
        );
    }

    let activeFilters = 0;
    if (search !== "") {
        activeFilters = activeFilters + 1;
    }
    if (location !== "") {
        activeFilters = activeFilters + 1;
    }
    if (contract !== null) {
        activeFilters = activeFilters + 1;
    }
    if (radius !== null) {
        activeFilters = activeFilters + 1;
    }

    let resetButton = null;
    if (activeFilters > 0) {
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

    let shellClass = "flex min-h-0 flex-1 flex-col bg-background";
    if (props.embedded === true) {
        shellClass =
            "mx-auto flex h-[38rem] w-full max-w-6xl flex-col border border-border bg-background";
    }

    let heading = (
        <h1 className="font-heading text-sm font-bold uppercase tracking-[0.08em] text-primary">
            Carte des offres d&apos;emploi
        </h1>
    );
    if (props.embedded === true) {
        heading = (
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.08em] text-primary">
                Carte des offres d&apos;emploi
            </h2>
        );
    }

    return (
        <div className={shellClass}>
            <div
                role="search"
                aria-label="Rechercher une offre d'emploi"
                className="flex flex-col gap-3 border-b border-border bg-background px-6 py-4"
            >
                {heading}

                <div className="flex flex-col gap-3 lg:flex-row">
                    <Input
                        value={search}
                        onChange={handleSearch}
                        placeholder="Métier, entreprise, secteur…"
                        className="lg:flex-1"
                        aria-label="Rechercher un métier"
                    />
                    <div ref={locationBoxRef} className="relative lg:w-72" onBlur={handleLocationBoxBlur}>
                    <Input
                        value={location}
                        onChange={handleLocation}
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
                        aria-controls="location-listbox"
                        aria-autocomplete="list"
                        aria-activedescendant={
                            highlightedIndex >= 0 ? `location-option-${highlightedIndex}` : undefined
                        }
                    />

                    {suggestionsOpen && suggestions.length > 0 && (
                        <ul
                            id="location-listbox"
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
                                        id={`location-option-${index}`}
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
                    <div
                        role="group"
                        aria-label="Filtrer par type de contrat"
                        className="flex flex-wrap items-center gap-2"
                    >
                        {CONTRACTS.map(function (value) {
                        let style = "border-border bg-background hover:border-primary";
                        if (contract === value) {
                            style = "border-primary bg-accent text-accent-foreground";
                        }

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={function () {
                                    toggleContract(value);
                                }}
                                aria-pressed={contract === value}
                                className={cn(
                                    "border px-3.5 py-1.5 font-heading text-xs font-medium transition-colors",
                                    style,
                                )}
                            >
                                {value}
                            </button>
                            );
                        })}
                    </div>

                    <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

                    {geoToggle}
                    {resetButton}
                </div>

                {radiusRow}
                {placeBlock}
                {geoBlock}
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                <aside
                    aria-label="Liste des offres"
                    className="order-2 h-full w-full overflow-y-auto border-border lg:order-1 lg:w-[26rem] lg:border-r"
                >
                    <JobList
                        jobs={visibleJobs}
                        total={results.length}
                        position={origin}
                        selectedJob={selectedJob}
                        onSelect={selectJob}
                    />
                </aside>

                <div className="isolate order-1 h-72 w-full lg:order-2 lg:h-full lg:flex-1">
                    <Map
                        jobs={mappableJobs}
                        selectedJob={selectedJob}
                        onSelect={selectJob}
                        targetLat={targetLat}
                        targetLon={targetLon}
                        targetZoom={targetZoom}
                        userLat={userLat}
                        userLon={userLon}
                        radiusKm={searchRadius}
                    />
                </div>
            </div>

            <JobDetails
                job={selectedJob}
                position={origin}
                open={detailsOpen}
                onClose={closeDetails}
            />
        </div>
    );
}

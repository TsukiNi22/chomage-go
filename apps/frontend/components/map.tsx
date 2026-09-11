"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
    Circle,
    MapContainer,
    Marker,
    TileLayer,
    Tooltip,
    ZoomControl,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_URL } from "@/lib/env";
import { Crosshair } from "lucide-react";

/** Point affiché sur la carte, indépendant de ce qu'il représente (offre, entreprise…). */
export type MapPoint = {
    id: number;
    lat: number;
    lon: number;
    title: string;
    subtitle: string;
    detail: string;
    /** Texte lu par les technologies d'assistance au survol du repère. */
    label: string;
};

function createIcon(color: string, size: number) {
    return L.divIcon({
        className: "",
        html:
            '<span style="display:block;width:' +
            size +
            "px;height:" +
            size +
            "px;border-radius:9999px;background:" +
            color +
            ';border:2px solid #ffffff;box-shadow:0 0 0 1px rgba(16,25,43,0.35)"></span>',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

const jobIcon = createIcon("#1b3a6b", 14);
const activeJobIcon = createIcon("#b85433", 22);
const userIcon = createIcon("#1c6144", 18);

const FRANCE_CENTER: [number, number] = [46.7, 2.4];
const FRANCE_ZOOM = 6;
const USER_RECENTER_ZOOM = 12;

function Recenter(props: { lat: number | null; lon: number | null; zoom: number }) {
    const map = useMap();
    const lat = props.lat;
    const lon = props.lon;
    const zoom = props.zoom;

    useEffect(
        function () {
            if (lat === null || lon === null) {
                return;
            }
            map.flyTo([lat, lon], zoom, { duration: 0.8 });
        },
        [map, lat, lon, zoom],
    );

    return null;
}

function ResizeHandler() {
    const map = useMap();

    useEffect(
        function () {
            const container = map.getContainer();

            const observer = new ResizeObserver(function () {
                map.invalidateSize();
            });

            observer.observe(container);

            return function () {
                observer.disconnect();
            };
        },
        [map],
    );

    return null;
}

function RecenterButton(props: { userLat: number | null; userLon: number | null }) {
    const map = useMap();
    const hasPosition = props.userLat !== null && props.userLon !== null;

    function handleClick() {
        if (props.userLat !== null && props.userLon !== null) {
            map.flyTo([props.userLat, props.userLon], USER_RECENTER_ZOOM, {
                duration: 0.8,
            });
        } else {
            map.flyTo(FRANCE_CENTER, FRANCE_ZOOM, { duration: 0.8 });
        }
    }

    const label = hasPosition
        ? "Recentrer sur ma position"
        : "Recentrer sur la France";

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={label}
            title={label}
            className="absolute bottom-6 right-3 z-[1000] flex h-9 w-9 items-center justify-center border border-border bg-background text-primary shadow-sm transition-colors hover:bg-accent"
        >
            <Crosshair className="h-4 w-4" />
        </button>
    );
}

type Props = {
    points: MapPoint[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    targetLat: number | null;
    targetLon: number | null;
    targetZoom: number;
    userLat?: number | null;
    userLon?: number | null;
    radiusKm?: number | null;
};

// Les tuiles passent par l'API plutot que d'aller directement chez l'IGN :
// le backend les met en cache sur disque, donc le meme fond n'est telecharge
// qu'une fois pour l'ensemble des visiteurs. L'attribution reste due a l'IGN.
const TILE_URL = API_URL + "/api/utils/tiles/{z}/{x}/{y}";

export default function Map(props: Props) {
    let userLat = null;
    let userLon = null;
    if (props.userLat !== undefined && props.userLat !== null) {
        userLat = props.userLat;
    }
    if (props.userLon !== undefined && props.userLon !== null) {
        userLon = props.userLon;
    }

    let userMarker = null;
    if (userLat !== null && userLon !== null) {
        userMarker = (
            <Marker
                position={[userLat, userLon]}
                icon={userIcon}
                title="Votre position"
                keyboard={false}
            >
                <Tooltip direction="top" offset={[0, -12]}>
                    Vous êtes ici
                </Tooltip>
            </Marker>
        );
    }

    let radiusCircle = null;
    if (
        userLat !== null &&
        userLon !== null &&
        props.radiusKm !== undefined &&
        props.radiusKm !== null
    ) {
        radiusCircle = (
            <Circle
                center={[userLat, userLon]}
                radius={props.radiusKm * 1000}
                pathOptions={{
                    color: "#1b3a6b",
                    weight: 1,
                    fillColor: "#1b3a6b",
                    fillOpacity: 0.06,
                }}
            />
        );
    }

    return (
        <MapContainer
            center={[46.7, 2.4]}
            zoom={6}
            scrollWheelZoom={true}
            zoomControl={false}
            className="h-full w-full"
        >
            <ZoomControl
                position="topleft"
                zoomInTitle="Zoomer"
                zoomOutTitle="Dézoomer"
            />

            <TileLayer
                url={TILE_URL}
                attribution='&copy; <a href="https://www.ign.fr/">IGN</a> - Géoplateforme'
                maxZoom={18}
            />

            <Recenter
                lat={props.targetLat}
                lon={props.targetLon}
                zoom={props.targetZoom}
            />

            {radiusCircle}
            {userMarker}

            {props.points.map(function (point) {
                let icon = jobIcon;
                let floating = false;
                if (props.selectedId !== null && props.selectedId === point.id) {
                    icon = activeJobIcon;
                    floating = true;
                }

                return (
                    <Marker
                        key={point.id}
                        position={[point.lat, point.lon]}
                        icon={icon}
                        title={point.label}
                        eventHandlers={{
                            click: function () {
                                props.onSelect(point.id);
                            },
                            keydown: function (event) {
                                const key = event.originalEvent.key;
                                if (key !== "Enter" && key !== " ") {
                                    return;
                                }
                                event.originalEvent.preventDefault();
                                props.onSelect(point.id);
                            },
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} permanent={floating}>
                            <span className="font-heading text-sm font-semibold text-primary">
                                {point.title}
                            </span>
                            <br />
                            <span className="text-xs">{point.subtitle}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">
                                {point.detail}
                            </span>
                        </Tooltip>
                    </Marker>
                );
            })}

            <RecenterButton userLat={userLat} userLon={userLon} />

            <ResizeHandler />
        </MapContainer>
    );
}

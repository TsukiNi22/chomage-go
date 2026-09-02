"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Job } from "@/lib/jobs";

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

type Props = {
    jobs: Job[];
    selectedJob: Job | null;
    onSelect: (job: Job) => void;
    targetLat: number | null;
    targetLon: number | null;
    targetZoom: number;
};

const IGN_WMTS_URL =
    "https://data.geopf.fr/wmts?" +
    "SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile" +
    "&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" +
    "&STYLE=normal&FORMAT=image/png" +
    "&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";

export default function Map(props: Props) {
    return (
        <MapContainer
            center={[46.7, 2.4]}
            zoom={6}
            scrollWheelZoom={true}
            className="h-full w-full"
        >
            <TileLayer
                url={IGN_WMTS_URL}
                attribution='&copy; <a href="https://www.ign.fr/">IGN</a> - Géoplateforme'
                maxZoom={19}
            />

            <Recenter
                lat={props.targetLat}
                lon={props.targetLon}
                zoom={props.targetZoom}
            />
            <ResizeHandler />
        </MapContainer>
    );
}

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

type Props = {
    jobs: Job[];
    selectedJob: Job | null;
    onSelect: (job: Job) => void;
    targetLat: number | null;
    targetLon: number | null;
    targetZoom: number;
};

export default function Map(props: Props) {
    return (
        <MapContainer
            center={[46.7, 2.4]}
            zoom={6}
            scrollWheelZoom={true}
            className="h-full w-full"
        >
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; les contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                maxZoom={19}
            />

            <Recenter
                lat={props.targetLat}
                lon={props.targetLon}
                zoom={props.targetZoom}
            />
        </MapContainer>
    );
}

"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Job } from "@/lib/jobs";


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
            ';border:2px solid #ffffff"></span>',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    })
}

const jobIcon = createIcon("#1b3a6b", 14);
const activeJobIcon = createIcon("#b85433", 22);


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
            {props.jobs.map(function (job) {
                let icon = jobIcon;
                let floating = false;
                if (props.selectedJob !== null && props.selectedJob.id === job.id) {
                    icon = activeJobIcon;
                    floating = true;
                }

                return (
                    <Marker
                        key={job.id}
                        position={[job.lat, job.lon]}
                        icon={icon}
                        eventHandlers={{
                            click: function () {
                                props.onSelect(job);
                            },
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} permanent={floating}>
                            <span className="font-heading text-sm font-semibold text-primary">
                                {job.title}
                            </span>
                            <br />
                            <span className="text-xs">{job.company}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">
                                {job.contract} · {job.city}
                            </span>
                        </Tooltip>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}

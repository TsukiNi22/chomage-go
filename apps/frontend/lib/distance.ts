export function distanceInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const earthRadius = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
}

export function formatDistance(km: number): string {
    if (km < 1) {
        return "À " + Math.round(km * 1000) + " m";
    }
    if (km < 10) {
        return "À " + km.toFixed(1).replace(".", ",") + " km";
    }
    return "À " + Math.round(km) + " km";
}

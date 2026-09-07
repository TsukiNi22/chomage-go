export type Place = {
    label: string;
    lat: number;
    lon: number;
    score: number;
};

const ENDPOINT = "https://api-adresse.data.gouv.fr/search/";

export function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

export async function searchPlace(query: string): Promise<Place | null> {
    const results = await searchPlaces(query, 1);
    if (results.length === 0) {
        return null;
    }
    return results[0];
}

export async function searchPlaces(query: string, limit: number = 5): Promise<Place[]> {
    const url = ENDPOINT + "?q=" + encodeURIComponent(query) + "&limit=" + limit;

    let response;
    try {
        response = await fetch(url);
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    if (!data.features) {
        return [];
    }

    return data.features.map(function (feature: {
        properties: { label: string; score: number };
        geometry: { coordinates: [number, number] };
    }) {
        return {
            label: feature.properties.label,
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            score: feature.properties.score,
        };
    });
}
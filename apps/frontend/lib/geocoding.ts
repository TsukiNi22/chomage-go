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
    const url = ENDPOINT + "?q=" + encodeURIComponent(query) + "&limit=1";

    let response;
    try {
        response = await fetch(url);
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    if (!data.features || data.features.length === 0) {
        return null;
    }

    const feature = data.features[0];

    return {
        label: feature.properties.label,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        score: feature.properties.score,
    };
}

import {db} from "../db/index.ts";
import {addresses} from "../db/schema.ts";

const GEOCODER_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";

export type AddressInput = {
    label: string;
    street?: string | null;
    postal_code?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
};

type Resolved = {
    label: string;
    street: string | null;
    postalCode: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    score: number | null;
    source: string;
};

async function geocode(label: string): Promise<Resolved | null>
{
    const url = GEOCODER_ENDPOINT + "?q=" + encodeURIComponent(label) + "&limit=1";

    let response;
    try {
        response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    const data: any = await response.json();
    const feature = data?.features?.[0];
    if (!feature) {
        return null;
    }

    return {
        label: feature.properties?.label || label,
        street: feature.properties?.name || null,
        postalCode: feature.properties?.postcode || null,
        city: feature.properties?.city || null,
        latitude: feature.geometry?.coordinates?.[1] ?? null,
        longitude: feature.geometry?.coordinates?.[0] ?? null,
        score: feature.properties?.score ?? null,
        source: "api-adresse",
    };
}

/**
 * Enregistre une adresse et renvoie son identifiant.
 * Les coordonnées fournies par l'appelant sont utilisées telles quelles ; à défaut,
 * l'adresse est géocodée par la Base Adresse Nationale.
 */
export async function createAddress(input: AddressInput): Promise<number | null>
{
    const label = input.label.trim();
    if (label === "") {
        return null;
    }

    let resolved: Resolved;

    if (input.latitude !== undefined && input.latitude !== null &&
        input.longitude !== undefined && input.longitude !== null) {
        resolved = {
            label: label,
            street: input.street ?? null,
            postalCode: input.postal_code ?? null,
            city: input.city ?? null,
            latitude: input.latitude,
            longitude: input.longitude,
            score: null,
            source: "api-adresse",
        };
    } else {
        const found = await geocode(label);
        if (found === null) {
            resolved = {
                label: label,
                street: input.street ?? null,
                postalCode: input.postal_code ?? null,
                city: input.city ?? null,
                latitude: null,
                longitude: null,
                score: null,
                source: "saisie",
            };
        } else {
            resolved = found;
        }
    }

    const located = resolved.latitude !== null && resolved.longitude !== null;

    const rows = await db.insert(addresses).values({
        label: resolved.label,
        street: resolved.street,
        postalCode: resolved.postalCode,
        city: resolved.city,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        geocodingSource: resolved.source,
        geocodingScore: resolved.score,
        geocodedAt: located ? new Date() : null,
        needsLocationCheck: !located,
    }).returning({ id: addresses.id });

    return rows[0].id;
}

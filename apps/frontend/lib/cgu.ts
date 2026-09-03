export const CGU_VERSION = "1.0";
export const CGU_DATE = "02/09/2026";

const STORAGE_KEY = "geoemploi.cgu.accepted";

export function readAcceptedVersion(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function saveAcceptedVersion(version: string) {
    try {
        window.localStorage.setItem(STORAGE_KEY, version);
    } catch {
        return;
    }
}

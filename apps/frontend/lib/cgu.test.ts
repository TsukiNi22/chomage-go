import {afterEach, describe, expect, it, vi} from "vitest";
import {CGU_VERSION, readAcceptedVersion, saveAcceptedVersion} from "./cgu";
import {GEO_NOTICE_VERSION, hasSeenNotice, saveNoticeSeen} from "./geolocation-notice";

function stubStorage(initial: Record<string, string> = {}) {
    const store = new Map(Object.entries(initial));

    vi.stubGlobal("window", {
        localStorage: {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => {
                store.set(key, value);
            },
        },
    });

    return store;
}

/** Navigation privée, cookies bloqués : l'accès au stockage lève. */
function stubBrokenStorage() {
    vi.stubGlobal("window", {
        get localStorage(): Storage {
            throw new Error("SecurityError");
        },
    });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("acceptation des CGU", () => {
    it("ne rend rien tant que rien n'a été accepté", () => {
        stubStorage();

        expect(readAcceptedVersion()).toBeNull();
    });

    it("relit la version enregistrée", () => {
        stubStorage();

        saveAcceptedVersion(CGU_VERSION);

        expect(readAcceptedVersion()).toBe(CGU_VERSION);
    });

    it("permet de détecter une acceptation devenue obsolète", () => {
        stubStorage({"geoemploi.cgu.accepted": "0.9"});

        expect(readAcceptedVersion()).not.toBe(CGU_VERSION);
    });

    it("rend null plutôt que de casser la page si le stockage est inaccessible", () => {
        stubBrokenStorage();

        expect(readAcceptedVersion()).toBeNull();
    });

    it("n'échoue pas non plus à l'écriture", () => {
        stubBrokenStorage();

        expect(() => saveAcceptedVersion(CGU_VERSION)).not.toThrow();
    });

    it("rend null hors navigateur, où window n'existe pas", () => {
        expect(readAcceptedVersion()).toBeNull();
    });
});

describe("mention d'information géolocalisation", () => {
    it("considère la mention non vue par défaut", () => {
        stubStorage();

        expect(hasSeenNotice()).toBe(false);
    });

    it("mémorise la version vue", () => {
        stubStorage();

        saveNoticeSeen();

        expect(hasSeenNotice()).toBe(true);
    });

    it("réaffiche la mention si la version enregistrée est ancienne", () => {
        stubStorage({"geoemploi.geolocation.notice.seen": "0.9"});

        expect(GEO_NOTICE_VERSION).not.toBe("0.9");
        expect(hasSeenNotice()).toBe(false);
    });

    it("réaffiche la mention si le stockage est inaccessible", () => {
        stubBrokenStorage();

        expect(hasSeenNotice()).toBe(false);
    });
});

import {mkdir, readFile, readdir, rename, stat, unlink, writeFile} from "node:fs/promises";
import {join, resolve} from "node:path";

/**
 * Cache disque des tuiles du fond de plan IGN.
 *
 * Sans lui, chaque navigateur qui ouvre la carte tire ses tuiles directement
 * de data.geopf.fr : le meme fond de France est retelecharge par visiteur, et
 * la carte tombe avec la Geoplateforme. On les mutualise ici.
 */

// Couche PLAN IGN v2, jeu de tuiles PM (Web Mercator), la meme que celle que
// le composant carte utilisait en direct.
const IGN_WMTS =
    "https://data.geopf.fr/wmts?" +
    "SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile" +
    "&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" +
    "&STYLE=normal&FORMAT=image/png" +
    "&TILEMATRIXSET=PM";

/** Le composant carte plafonne a 18 ; on laisse une marge d'un niveau. */
export const MAX_ZOOM = 19;

/** Un fond de plan bouge a l'echelle du trimestre, pas de la journee. */
export const TILE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function tileCacheDir(): string
{
    return resolve(process.env.TILE_CACHE_DIR || ".cache/tuiles");
}

/**
 * Valide les coordonnees avant tout acces disque ou reseau.
 * Sans cette barriere, la route serait un proxy ouvert et le nom de fichier
 * serait construit a partir d'une entree utilisateur non contrainte.
 */
export function isValidTile(z: number, x: number, y: number): boolean
{
    if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) {
        return false;
    }
    if (z < 0 || z > MAX_ZOOM) {
        return false;
    }
    const limit = 2 ** z;
    return x >= 0 && x < limit && y >= 0 && y < limit;
}

/** Meme convention que le dossier .cache/tuiles deja present : z-x-y.png */
export function tileFileName(z: number, x: number, y: number): string
{
    return `${z}-${x}-${y}.png`;
}

export function tileSourceUrl(z: number, x: number, y: number): string
{
    return IGN_WMTS + `&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`;
}

export function isFresh(modifiedAt: number, now: number = Date.now()): boolean
{
    return now - modifiedAt < TILE_TTL_MS;
}

// Une tuile manquante demandee par dix visiteurs a la fois ne doit declencher
// qu'un seul appel a la Geoplateforme.
const inFlight = new Map<string, Promise<Buffer>>();

async function download(z: number, x: number, y: number): Promise<Buffer>
{
    const response = await fetch(tileSourceUrl(z, x, y), {
        signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
        throw new Error(`IGN a repondu ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

async function store(dir: string, name: string, data: Buffer)
{
    await mkdir(dir, {recursive: true});
    // Ecriture puis renommage : un lecteur concurrent ne voit jamais un PNG tronque.
    const tmp = join(dir, name + ".tmp");
    await writeFile(tmp, data);
    await rename(tmp, join(dir, name));
}

export type TileResult = {
    data: Buffer;
    /** "hit" si la tuile venait du disque, "miss" si elle a ete telechargee. */
    source: "hit" | "miss";
};

export async function readTile(z: number, x: number, y: number): Promise<TileResult>
{
    const dir = tileCacheDir();
    const name = tileFileName(z, x, y);
    const path = join(dir, name);

    try {
        const info = await stat(path);
        if (isFresh(info.mtimeMs)) {
            return {data: await readFile(path), source: "hit"};
        }
    } catch {
        // absente ou illisible : on la telecharge
    }

    const key = name;
    let pending = inFlight.get(key);
    if (pending === undefined) {
        pending = download(z, x, y).finally(() => inFlight.delete(key));
        inFlight.set(key, pending);
    }

    const data = await pending;

    try {
        await store(dir, name, data);
    } catch {
        // Le cache est une optimisation : si le disque refuse, on sert quand meme.
    }

    return {data: data, source: "miss"};
}

/**
 * Supprime les tuiles perimees. Appelee par la maintenance quotidienne : sans
 * elle le dossier ne ferait que croitre.
 */
export async function purgeExpiredTiles(now: number = Date.now()): Promise<number>
{
    const dir = tileCacheDir();

    let names;
    try {
        names = await readdir(dir);
    } catch {
        return 0; // pas encore de cache
    }

    let removed = 0;
    for (const name of names) {
        if (!name.endsWith(".png") && !name.endsWith(".tmp")) {
            continue;
        }
        try {
            const info = await stat(join(dir, name));
            if (!isFresh(info.mtimeMs, now)) {
                await unlink(join(dir, name));
                removed = removed + 1;
            }
        } catch {
            // disparue entre-temps
        }
    }

    return removed;
}

import {Request, Response, NextFunction} from "express";
import {HttpError} from "../types/httpError.ts";
import {MAX_ZOOM, TILE_TTL_MS, isValidTile, readTile} from "../utils/tiles.utils.ts";

export async function getTile(req: Request, res: Response, next: NextFunction)
{
    const z = Number(req.params.z);
    const x = Number(req.params.x);
    const y = Number(req.params.y);

    if (!isValidTile(z, x, y)) {
        throw new HttpError(400, `Coordonnees de tuile invalides (z entre 0 et ${MAX_ZOOM})`);
    }

    let tile;
    try {
        tile = await readTile(z, x, y);
    } catch {
        throw new HttpError(502, "Le fond de plan IGN est injoignable");
    }

    res.set({
        "Content-Type": "image/png",
        // Le navigateur garde la tuile aussi longtemps que notre propre cache.
        "Cache-Control": `public, max-age=${Math.floor(TILE_TTL_MS / 1000)}, immutable`,
        "X-Tile-Cache": tile.source,
    });
    res.send(tile.data);

    next();
}

import {describe, expect, it} from "vitest";
import {z} from "zod";
import {validateJson} from "./validateJson.utils.ts";
import {mockRequest, mockResponse} from "../testing/express.mocks.ts";

const schema = z.object({
    job_id: z.number().int(),
    description: z.string().optional(),
});

describe("validateJson", () => {
    it("accepte un corps valide sans rien envoyer au client", () => {
        const req = mockRequest({body: {job_id: 12, description: "Bonjour"}});
        const captured = mockResponse();

        expect(validateJson(schema, req, captured.res)).toBe(true);
        expect(captured.calls).toBe(0);
    });

    it("remplace req.body par la valeur analysée, donc débarrassée des champs inconnus", () => {
        const req = mockRequest({body: {job_id: 12, rank: 0, __proto__polluant: true}});
        const captured = mockResponse();

        validateJson(schema, req, captured.res);

        // Zod retire ce qui n'est pas déclaré : un client ne peut pas glisser
        // un champ que le controller réinjecterait ensuite en base.
        expect(req.body).toEqual({job_id: 12});
    });

    it("répond 400 et rend false quand un champ requis manque", () => {
        const req = mockRequest({body: {description: "sans offre"}});
        const captured = mockResponse();

        expect(validateJson(schema, req, captured.res)).toBe(false);
        expect(captured.status).toBe(400);
        expect(captured.body.error).toBe("Invalid request body");
    });

    it("détaille le champ fautif dans la réponse", () => {
        const req = mockRequest({body: {job_id: "douze"}});
        const captured = mockResponse();

        validateJson(schema, req, captured.res);

        expect(captured.body.details.fieldErrors.job_id).toBeDefined();
    });

    it("ne modifie pas req.body quand la validation échoue", () => {
        const body = {job_id: "douze"};
        const req = mockRequest({body: body});
        const captured = mockResponse();

        validateJson(schema, req, captured.res);

        expect(req.body).toBe(body);
    });
});

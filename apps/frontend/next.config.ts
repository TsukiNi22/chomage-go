import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL n'est pas definie. Le front ne peut pas joindre " +
            "l'API : copiez apps/frontend/.env.example vers " +
            "apps/frontend/.env.local, ou definissez-la dans la section " +
            "environment du service frontend.",
    );
}

const nextConfig: NextConfig = {};

export default nextConfig;

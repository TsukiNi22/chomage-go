import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL n'est pas definie. Le front ne peut pas joindre " +
            "l'API : copiez apps/frontend/.env.example vers " +
            "apps/frontend/.env.local, ou definissez-la dans la section " +
            "environment du service frontend.",
    );
}

const nextConfig: NextConfig = {
<<<<<<< Updated upstream
    allowedDevOrigins: ['10.168.145.219', '192.168.1.42'],
    //output: "export"
=======
    allowedDevOrigins: ['10.10.255.151', '10.168.145.219', '192.168.1.42'],
>>>>>>> Stashed changes
};

export default nextConfig;

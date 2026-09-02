"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

const FULL_HEIGHT_PATHS = ["/carte"];

export default function AppFrame(props: { children: React.ReactNode }) {
    const pathname = usePathname();
    const fullHeight = FULL_HEIGHT_PATHS.includes(pathname);

    if (fullHeight) {
        return (
            <div className="flex h-screen flex-col overflow-hidden">
                <Header />
                <main className="flex min-h-0 flex-1 flex-col bg-wash px-6 py-6">
                    {props.children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{props.children}</main>
            <Footer />
        </div>
    );
}

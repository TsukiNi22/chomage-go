"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AccountModerationDialog from "@/components/account-moderation-dialog";

const FULL_HEIGHT_PATHS = ["/carte", "/entreprises"];

export default function AppFrame(props: { children: React.ReactNode }) {
    const pathname = usePathname();
    const fullHeight = FULL_HEIGHT_PATHS.includes(pathname);

    if (fullHeight) {
        return (
            <div className="flex h-screen flex-col overflow-hidden">
                <Header />
                <main
                    id="contenu"
                    tabIndex={-1}
                    className="flex min-h-0 flex-1 flex-col outline-none"
                >
                    {props.children}
                </main>
                <Footer compact />
                <AccountModerationDialog />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
                {props.children}
            </main>
            <Footer />
            <AccountModerationDialog />
        </div>
    );
}

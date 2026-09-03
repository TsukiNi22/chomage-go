"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    CGU_VERSION,
    readAcceptedVersion,
    saveAcceptedVersion,
} from "@/lib/cgu";

type CguState = {
    ready: boolean;
    accepted: boolean;
    previousVersion: string | null;
    accept: () => void;
};

const CguContext = createContext<CguState>({
    ready: false,
    accepted: false,
    previousVersion: null,
    accept: function () {},
});

export function useCgu() {
    return useContext(CguContext);
}

export default function CguProvider(props: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [previousVersion, setPreviousVersion] = useState<string | null>(null);

    useEffect(function () {
        const stored = readAcceptedVersion();
        setPreviousVersion(stored);
        if (stored === CGU_VERSION) {
            setAccepted(true);
        }
        setReady(true);
    }, []);

    function accept() {
        saveAcceptedVersion(CGU_VERSION);
        setAccepted(true);
    }

    const value = {
        ready: ready,
        accepted: accepted,
        previousVersion: previousVersion,
        accept: accept,
    };

    return <CguContext.Provider value={value}>{props.children}</CguContext.Provider>;
}

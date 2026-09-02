import Hero from "@/components/hero";
import KeyFigures from "@/components/key-figures";
import HowItWorks from "@/components/how-it-works";
import MapExplorer from "@/components/map-explorer";

export default function Home() {
    return (
        <>
            <Hero />
            <KeyFigures />
            <div id="jobs" className="border-b border-border bg-wash px-6 py-12">
                <MapExplorer embedded={true} />
            </div>
            <div id="how">
                <HowItWorks />
            </div>
        </>
    );
}

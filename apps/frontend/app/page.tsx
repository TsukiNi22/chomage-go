import Hero from "@/components/hero";
import KeyFigures from "@/components/key-figures";
import HowItWorks from "@/components/how-it-works";
import ServiceInfo from "@/components/service-info";
import MapExplorer from "@/components/map-explorer";
import { fetchJobs } from "@/lib/api";

export default async function Home() {
    const jobs = await fetchJobs();

    return (
        <>
            <Hero />
            <KeyFigures jobs={jobs} />
            <div id="how">
                <HowItWorks />
            </div>
            <div id="jobs" className="border-b border-border bg-wash px-6 py-12">
                <MapExplorer embedded={true} jobs={jobs} />
            </div>
            <ServiceInfo />
        </>
    );
}

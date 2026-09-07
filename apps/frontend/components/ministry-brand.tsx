import Image from "next/image";

type Props = {
    compact?: boolean;
};

export default function MinistryBrand(props: Props) {
    let nameClass = "font-heading text-xl font-bold tracking-tight text-primary";
    let logoSize = 70;
    if (props.compact === true) {
        nameClass = "font-heading text-base font-bold tracking-tight text-primary";
        logoSize = 38;
    }

    return (
        <div className="flex items-center gap-4">
            <Image
                src="/logo.png"
                alt="logo du site"
                width={logoSize}
                height={logoSize}
                priority
            />

            {/* <div className="hidden border-r border-border pr-4 sm:block">
                <p className="mt-1.5 font-heading text-[0.55rem] italic leading-[1.2] text-muted-foreground">
                    Liberté
                    <br />
                    Égalité
                    <br />
                    Fraternité
                </p>
            </div> */}

            <span className={nameClass}>ChômageGo</span>
        </div>
    );
}

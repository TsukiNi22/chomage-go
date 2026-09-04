import Image from "next/image";

type Props = {
    compact?: boolean;
};

export default function MinistryBrand(props: Props) {
    let nameClass = "font-heading text-xl font-bold tracking-tight text-primary";
    let logoSize = 52;
    if (props.compact === true) {
        nameClass = "font-heading text-base font-bold tracking-tight text-primary";
        logoSize = 38;
    }

    return (
        <div className="flex items-center gap-4">
            <Image
                src="/logo.png"
                alt="Ministère du Job et Bonheur"
                width={logoSize}
                height={logoSize}
                priority
            />

            <div className="hidden border-r border-border pr-4 sm:block">
                <p className="font-heading text-[0.62rem] font-bold uppercase leading-[1.2] tracking-[0.1em] text-primary">
                    Ministère
                    <br />
                    du Job
                    <br />
                    et Bonheur
                </p>
                <p className="mt-1.5 font-heading text-[0.55rem] italic leading-[1.2] text-muted-foreground">
                    Liberté
                    <br />
                    Égalité
                    <br />
                    Fraternité
                </p>
            </div>

            <span className={nameClass}>ChômageGo</span>
        </div>
    );
}

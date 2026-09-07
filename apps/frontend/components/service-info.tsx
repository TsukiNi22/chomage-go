import Link from "next/link";

export const DPO_EMAIL = "f.pontaillac@job-et-bonheur.fr";

const items = [
    {
        title: "Gratuit, sans compte pour consulter",
        body: "La consultation des offres sur la carte est libre et sans création de compte. Le service est gratuit pour les candidats comme pour les employeurs : aucun abonnement, aucune option payante, aucune commission sur les recrutements.",
    },
    {
        title: "Durée de conservation des données",
        body: "Vos données sont conservées tant que votre compte existe. La suppression des comptes inactifs depuis plus de 2 ans est prévue mais n'est pas encore implémentée à ce jour. La position de votre appareil, elle, n'est jamais conservée : elle disparaît dès que vous quittez la page.",
    },
];

export default function ServiceInfo() {
    return (
        <section className="border-b border-border bg-background px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <h2 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Ce que vous devez savoir
                </h2>

                <div className="mt-6 grid gap-8 lg:grid-cols-3">
                    {items.map(function (item) {
                        return (
                            <div
                                key={item.title}
                                className="flex flex-col gap-2 border-l-2 border-primary pl-4"
                            >
                                <h3 className="font-heading text-base font-bold text-primary">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {item.body}
                                </p>
                            </div>
                        );
                    })}

                    <div className="flex flex-col gap-2 border-l-2 border-primary pl-4">
                        <h3 className="font-heading text-base font-bold text-primary">
                            Délégué à la protection des données
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Pour exercer vos droits d&apos;accès, de rectification ou de
                            suppression, ou pour toute question sur le traitement de vos
                            données :
                        </p>
                        <a
                            href={"mailto:" + DPO_EMAIL}
                            className="font-heading text-sm font-semibold text-primary underline underline-offset-4 hover:no-underline"
                        >
                            {DPO_EMAIL}
                        </a>
                        <p className="text-sm text-muted-foreground">
                            Consultez la{" "}
                            <Link
                                href="/registre"
                                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                            >
                                fiche de registre
                            </Link>{" "}
                            pour le détail des données collectées.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

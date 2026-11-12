import { createFileRoute, Link } from "@tanstack/react-router";
import { CountyView } from "@/components/county-view";
import { buttonClass } from "@/components/ui";
import { getCounty } from "@/data/catalog";

export const Route = createFileRoute("/county/$fips")({
  head: ({ params }) => {
    const county = getCounty(params.fips);
    const title = county
      ? `${county.name} County, ${county.state} · Hands On Tax Liens`
      : "County · Hands On Tax Liens";
    return { meta: [{ title }] };
  },
  component: CountyPage,
});

function CountyPage() {
  const { fips } = Route.useParams();
  const county = getCounty(fips);
  if (!county) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16">
        <h1 className="font-display text-3xl">No county file</h1>
        <p className="text-sm text-muted">
          Nothing in the national table uses FIPS {fips}. The map covers counties that are on file, not
          every possible code.
        </p>
        <Link to="/" className={buttonClass("gold")}>
          Back to the atlas
        </Link>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-3xl">
      <CountyView county={county} mode="full" />
    </main>
  );
}

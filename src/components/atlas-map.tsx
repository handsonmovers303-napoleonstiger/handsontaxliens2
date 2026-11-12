import { useEffect, useState, type ComponentType } from "react";

type Props = {
  selected: string;
  system: "all" | "lien" | "deed";
  datedOnly: boolean;
  state: string;
  onSelect: (fips: string) => void;
};

export function AtlasMap(props: Props) {
  const [Client, setClient] = useState<ComponentType<Props> | null>(null);

  useEffect(() => {
    let on = true;
    void import("./atlas-map-view").then((mod) => {
      if (on) setClient(() => mod.AtlasMapClient);
    });
    return () => {
      on = false;
    };
  }, []);

  if (!Client) {
    return (
      <div className="grid h-full place-items-center bg-bg px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Loading the county map</p>
      </div>
    );
  }

  return <Client {...props} />;
}

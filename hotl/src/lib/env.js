// Artifact build (npm run build:artifact): one self-contained page for claude.ai.
// Its sandbox blocks Supabase, map tiles and GPS, so those paths switch off there
// and research stays in the viewer's browser.
export const ARTIFACT = import.meta.env.VITE_ARTIFACT === "1";

/** Probe Formsprache, vorläufig (17.09.2026): Farbe des Kopfbands je Datensatz.
 *  Dunkle Töne, Creme darauf zwischen 11,2:1 und 12,6:1. Die Kommunalwahl erbt
 *  das Band vorläufig in Nachtblau; entschieden wird das in der Wahl-Runde. */
const THEMENFARBE: Record<string, string> = {
  bahnhofumfrage_2023: "#123b4a", // Isar-Petrol
  volksfest_2024: "#6d0818", // Tiefrot
  statistik_kommunal_2022: "#6e5a30", // Gold-700
  kommunalwahl_2026: "#26295e", // Nachtblau
};

export const themenfarbe = (id: string) => THEMENFARBE[id] ?? "#6d0818";

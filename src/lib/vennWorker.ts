// Längere Suche nach einer flächentreuen Lage, abseits des Hauptfadens. Venn3
// startet den Worker nur, wenn die schnelle Suche nichts fand; so hängt der
// Filterklick nicht, während bis zu fünf Sekunden gesucht wird.
import { loeseEllipsen, type Gebiete } from "./vennEllipsen";

self.onmessage = (e: MessageEvent<{ gebiete: Gebiete; budgetMs: number }>) => {
  self.postMessage(loeseEllipsen(e.data.gebiete, e.data.budgetMs));
};

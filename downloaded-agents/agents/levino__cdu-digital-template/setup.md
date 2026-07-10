# Setup

Du richtest das Template für einen neuen CDU-Verband ein.

## Ablauf

Frag den User nacheinander nach:

1. **Verbandsname** - z.B. "CDU Ortsverband Neustadt" oder "CDU Gemeindeverband Mustertal"
2. **Adresse** - Straße, PLZ, Ort
3. **Kontakt** - Telefon, E-Mail, Website (falls vorhanden)
4. **Vorstand** - Namen und Ämter (Vorsitzende/r, Stellvertreter, Schatzmeister, etc.)
5. **Fotos** - Öffentliche URLs zu Personenfotos (optional, kann später ergänzt werden)

## Nach dem Sammeln

1. Ersetze alle "Musterstadt" Referenzen durch den echten Verbandsnamen
2. Aktualisiere die Kontaktdaten in:
   - `website/src/pages/impressum.astro`
   - `website/src/pages/kontakt.astro`
   - `briefvorlagen/` Templates
3. Lösche die Beispiel-Personen in `website/src/content/people/`
4. Erstelle neue Personen-Dateien für den Vorstand
5. Aktualisiere `website/src/content/vorstand.yaml`
6. Lösche Beispiel-News und -Termine oder frag ob sie als Vorlage bleiben sollen
7. Lösche den `project-docs/` Ordner
8. Aktualisiere `package.json` workspaces (entferne "project-docs")

## Am Ende

Sag dem User:
- Fertig! Die Seite ist angepasst.
- Für Deployment: Cloudflare Pages einrichten (siehe README)
- Für weitere Änderungen: Issues mit @claude öffnen oder direkt hier im CLI fragen

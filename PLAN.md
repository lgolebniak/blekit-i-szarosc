# Plan: od jednego pliku do gry na Xboxa

## Etap 0 – repozytorium ✅
Gra, narzędzia testowe, plan.

## Etap 1 – porządek w kodzie (fundament pod resztę)
- Projekt Vite, kod w modułach: `rdzen`, `teren`, `jednostki`, `walka`, `sztuczna-inteligencja`, `dzwiek`, `sterowanie`, `menu`,
  epoki osobno: `secesja`, `rzym`, `1939`, `husaria`.
- Zastąpienie nakładanych na siebie „łatek” (funkcje podmieniane później w pliku) jedną czystą wersją każdej funkcji.
- Dwa wyniki budowania: **jeden plik** (artefakt, gra offline z pendrive’a) i **folder z zasobami** (paczka na Xboxa).
- Testy (symulacja wszystkich bitew) w GitHub Actions po każdej zmianie.

## Etap 2 – Xbox w trybie deweloperskim
**Po Twojej stronie (raz):**
1. Konto deweloperskie w Microsoft Partner Center (jednorazowa opłata – sprawdź aktualną kwotę przy rejestracji).
2. Na Xboxie: aplikacja **Dev Mode Activation** ze sklepu → aktywacja kodem z Partner Center → restart do trybu deweloperskiego.
3. W Dev Home włącz **Device Portal** (zdalny dostęp, login i hasło). Adres: `https://IP-XBOXA:11443`.

**Po mojej stronie:**
- Aplikacja-powłoka (UWP/WinUI) z **WebView2**, która ładuje grę z plików paczki: pełny ekran, działa offline,
  pady obsługiwane bezpośrednio (bez „trybu przeglądarki”, B nie cofa strony).
- Budowanie paczki **.msix** z certyfikatem testowym w GitHub Actions (maszyna Windows) – nie potrzebujesz Visual Studio.

**Instalacja:** pobierasz .msix (i zależności) z GitHub Actions → Device Portal → *Dodaj* → gra pojawia się w „Moje gry i aplikacje”.
Debugowanie: `edge://inspect` na komputerze, podłączone do Device Portal.

## Etap 3 – dźwięk wyższej jakości
1. Bez nowych materiałów: pogłos otwartego pola, ściszanie i tłumienie dalekich dźwięków, lepsze źródło głosu,
   chór 20–30 głosów renderowany raz przy starcie, strzały warstwowe (trzask + huk + echo).
2. Nagrania (największy skok, uniezależnia od głosów systemu – na Xboxie lektor może nie działać):
   lista do nagrania niżej. Ja: czyszczenie, „rozmnożenie” w chór, pogłos, kompresja do OGG (~1–2 MB razem).

### Do nagrania (telefon wystarczy)
- 3–5 osób, na dworze albo w pokoju bez echa, 1–2 m od telefonu, każda fraza 3 razy, osobne pliki.
- **Bogurodzica** – dwa pierwsze wersy, wolno, unisono: „Bogurodzica dziewica, Bogiem sławiena Maryja”.
- Okrzyki: „Jezus Maria!”, „Bij! Zabij!”, „Wiwat! Wiwat!”, długie „Hurraaa!”, rozkazy „Pal!” i „Ognia!” (jedna osoba).
- Ranni: kilka krótkich krzyków i jęków (każdy inny).
- Opcjonalnie: „Allah! Allah!”, „Ura!”, „Gud med oss!”, „Hurrah!”, rebel yell.

## Etap 4 – grafika w 2× rozdzielczości (1920×1080, natywnie na telewizorze)
Logika gry zostaje w 960×540, rysowanie w 2×: najpierw teren (drzewa, woda, wzgórza), potem husaria i reszta postaci,
potem HUD i menu z ostrzejszymi czcionkami. Po każdym kroku gra działa.

## Etap 5 – dalej
Kampania z kolejnymi bitwami, zapis ustawień, więcej bitew historycznych (np. Wiedeń 1683, Orsza 1514).

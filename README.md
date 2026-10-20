# Błękit i Szarość

Bitwy na dwa pady w stylu *North & South* (Amiga): wojna secesyjna, Rzym (Cezar, Kartagina, Galowie), wrzesień 1939
i trzy bitwy husarii – **Kircholm 1605, Kłuszyn 1610, Chocim 1673**.

- `index.html` – cała gra w jednym pliku (działa offline; otwórz w przeglądarce, pady przez Gamepad API).
- `wersja-przed-husaria.html` – stan sprzed dodania husarii (do porównań).
- `narzedzia/` – testy w przeglądarce bez okna (Playwright):
  - `symulacja.js` – 150 s bitwy w każdej z 8 wersji, łapie błędy i robi zrzuty do `zrzuty/`,
  - `pojedynek.js` – statystyka szarży husarii (40 prób na cel),
  - `probki-dzwieku.js` – renderuje okrzyki i odgłosy do `probki/*.wav`.

```
npm i -D playwright && npx playwright install chromium
node narzedzia/symulacja.js
```

Plan dalszych prac: [PLAN.md](PLAN.md).

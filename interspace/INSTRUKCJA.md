# Interspace: nowa strona studia. Instrukcja, stan i lista do dokończenia

Ten plik jest jedynym źródłem prawdy dla tej strony. Stare instrukcje i stare skille nie obowiązują (decyzja Roberta z 11.11.2026). Kto siada do pracy, człowiek albo Claude na Macu, czyta to od góry do dołu i jedzie dalej.

## 1. Cel i miara sukcesu

Strona agencji premium Interspace. Gość ma wchodzić w interakcję ze stroną od pierwszej sekundy do końca, a na końcu ma pomyśleć „ja też taką chcę” i napisać. Każda decyzja jest oceniana tym jednym pytaniem: czy to przybliża gościa do kliknięcia „Chcę taką stronę”.

## 2. Założenia (ustalone w rozmowie)

- Wolna ręka w projekcie, poziom Awwwards, agencja premium.
- Stare wersje strony (v6 Portal ciemna, v14 Soczewka biała ze szklanym pierścieniem) Robert ocenił jako słabe. Nie wracamy do pierścienia, soczewki ani kobaltu.
- Ze starej strony bierzemy tylko fakty i teksty: hasło „Twój produkt w roli głównej”, branże (restauracje, sklepy, pensjonaty), cena od 4 900 zł, cztery tygodnie, adres kontakt@interspace.studio, kontakt bez telefonu.
- Teksty w liczbie mnogiej („robimy”, „napisz do nas”), bo Robert mówi „nasza agencja”. Do potwierdzenia przez Roberta, stara strona mówiła „robię”.
- Assety (obraz, wideo, rendery) mają powstawać lokalnie na Macu: ComfyUI, Blender. Sesja w chmurze nie widziała Maca, więc ta wersja nie używa żadnych wygenerowanych obrazów. Wszystko rysuje przeglądarka na żywo.
- Zero zmyślonych realizacji, opinii i liczb. Zero długich myślników i korpo-słów w tekstach.
- Podgląd ma `noindex`. Wdrożenie na domenę dopiero po decyzji Roberta.

## 3. Koncept

Zdanie: **białe studio fotograficzne, w którym jedna bryła na kole staje się produktem gościa.**

- Świat: jasny plan zdjęciowy, miękki cień, czerwona lampka nagrywania jako jedyny akcent.
- Mechanika: scroll zmienia bryłę (flakon dla sklepu, miska dla restauracji, dzwonek dla pensjonatu). Bryły to powierzchnie obrotowe o tej samej liczbie punktów, więc przenikają się płynnie, na sprężynie.
- Instrument gościa: łapie bryłę i kręci kołem, myszką prowadzi światło i cień, w panelu wybiera bohatera i kolor, wpisuje nazwę firmy. Nazwa pojawia się na obwodzie koła, w napisach końcowych i na plakacie w finale.
- Lądowanie: kadr z jego nazwą i przycisk „Chcę taką stronę”. Mail otwiera się z gotowym tematem i wybranymi opcjami.
- Motyw typograficzny: napisy końcowe jak na plakacie filmowym („Interspace przedstawia · w roli głównej [firma]”), numerowane ujęcia 00 do 05.

Podróż (tryb przypięty, 660vh):

| Ujęcie | Zakres scrolla | Co widać | Co robi gość |
|---|---|---|---|
| 00 Wejście | 0 do 0.115 | Hasło, lead, flakon | Kręci bryłą, rusza światłem |
| 01 Sklep | 0.15 do 0.30 | Flakon | jw. |
| 02 Restauracja | 0.33 do 0.48 | Miska | jw. |
| 03 Pensjonat | 0.51 do 0.66 | Dzwonek | jw. |
| 04 Twoja kolej | 0.70 do 0.86 | Panel: nazwa, bohater, kolor | Ustawia swój kadr |
| 05 Kadr gotowy | 0.90 do 1 | Plakat z nazwą, CTA | Klika „Chcę taką stronę” |

## 4. System wyglądu

Kolory (tokeny w `site/assets/site.css`):

- `--paper #f3f2ee` tło, `--ink #121210` tekst, `--ink-2 #56554f` tekst drugiego planu, `--line #cfccc3` linie.
- `--rec #ff3d1f` akcent. Tylko kropka, cienkie detale na bryle i numer ujęcia. `--rec-d #c92a10` dla tekstu i hovera (kontrast).
- Kolory szkliwa do wyboru: Atrament `#141412`, Cynober `#e3331a`, Kobalt `#1f3fd1`, Butelkowa zieleń `#1d5a43`, Kość `#ece8de`.

Typografia (dwie rodziny, pliki w `site/assets/fonts`):

- Archivo zmienny (grubość i szerokość). Nagłówki: szerokość 84%, grubość 640, światło liter -0.05em. Etykiety: szerokość 62 do 68%, wersaliki, światło 0.16em.
- Instrument Serif kursywa: jedno wyróżnione słowo w nagłówku („głównej”, nazwa firmy).

ZAWSZE: tekst w DOM, jedna bryła w kadrze, dużo pustego miejsca, ruch na krzywej `cubic-bezier(.16,1,.3,1)`, cena na wierzchu.
NIGDY: karty w siatce, gradienty, drugi akcent, zdjęcia stockowe, zmyślone dowody, długie myślniki.

## 5. Kod

```
interspace/
  INSTRUKCJA.md        ten plik
  package.json         three 0.187, lenis, esbuild (gsap zainstalowany, jeszcze nieużyty)
  src/shapes.js        profile brył i materiały na punkt (kolor, metal, szorstkość, lakier)
  src/scene.js         scena three.js: studio świetlne, koło z nazwą, przenikanie, cień, kręcenie
  src/main.js          scroll, ujęcia, panel, nazwa, mail, tryby, ekran startowy
  site/index.html      strona (statyczna)
  site/assets/site.css style
  site/assets/site.js  zbudowany pakiet (commitowany, żeby strona działała bez budowania)
  docs/                zrzuty z testów
```

Uruchomienie:

```
cd interspace
npm install
npm run dev      # podgląd na http://localhost:4173 z przebudową
npm run build    # zapis do site/assets/site.js
```

Po każdej zmianie skryptu lub stylu podbij `?v=N` w `site/index.html`.

Jak to działa w skrócie:

- Dwa tryby. Przypięty (desktop): scena przyklejona, kroki jako warstwy sterowane postępem scrolla. Płynny (ekran do 860 px, niskie okno, ograniczony ruch): canvas przyklejony u góry, kroki jeden pod drugim, aktywny krok wybiera bryłę. Warunek trybu jest identyczny w CSS i w JS (`FLOW` w `main.js`).
- Nowa bryła: dopisz profil w `SHAPES` w `shapes.js` (punkty r, y od osi na dole do osi na górze), dodaj `data-shape` w kroku i przycisk w panelu.
- Materiał na wierzchołek: atrybut `aPbr` i wstrzyknięcie w shader `MeshPhysicalMaterial` w `scene.js`.
- Link osobisty: `?firma=Nazwa` wstawia nazwę od razu (czyszczone, do 28 znaków).
- Bez WebGL strona pokazuje komunikat i działa dalej jako tekst.

## 6. Co jest zrobione i sprawdzone

Sprawdzone w Chromium bez karty graficznej (render programowy), zrzuty w `docs/`:

- Pierwszy ekran 1440x900 i telefon 390x844. Konsola bez błędów.
- Wszystkie sześć ujęć na desktopie, przenikanie brył, panel, zmiana koloru i bohatera, nazwa z linku na kole i w finale, link mailowy z tematem.

Niesprawdzone: prawdziwy iPhone i Safari, dotyk i kręcenie palcem, płynność na prawdziwej karcie graficznej, czytnik ekranu, kontrast liczony liczbowo, tryb ograniczonego ruchu.

## 7. Znane usterki (do poprawy w pierwszej kolejności)

1. Finał desktop: etykieta „05 Kadr gotowy” nachodzi na koło, a bryła nie zawsze dojeżdża do środka. Ostatnia poprawka układu (`oy`, `zoom` w `drive()`) jest wgrana, ale nieobejrzana.
2. Litera „g” w „głównej” jest przycięta z lewej (maska linii nagłówka). Zwiększyć lewy margines maski w `h1 .ln`.
3. Ekran startowy na słabym sprzęcie trwa za długo, bo czeka na pierwszą klatkę sceny.
4. Telefon: panel i finał obejrzane tylko na pierwszym ekranie, reszta do przejścia.
5. Linki w nawigacji prowadzą tylko do finału, bo sekcji niżej jeszcze nie ma.
6. Metal dzwonka i nakrętki wychodzi szary. Poprawić studio świetlne albo ekspozycję.

## 8. Co trzeba dokończyć

Kolejność ma znaczenie.

1. Robert ogląda pierwszy ekran i podróż. Decyzja: idziemy tym konceptem czy zmiana.
2. Usterki z punktu 7.
3. Sekcje pod podróżą, każda z jedną interakcją: dowód (pokazy na żywo, tylko prawdziwe), oferta w sześciu punktach, proces w czterech krokach, cennik (4 900, 9 900, opieka 199 zł miesięcznie, płatność 50/50), pytania, kontakt. Teksty ze starej strony, przepisane na krótsze.
4. Dźwięk koła i kliknięcia, wyłączony na starcie, z przełącznikiem.
5. Telefon: kręcenie palcem, przechył telefonu jako światło, menu.
6. Ruch nagłówków w ujęciach (wejścia per słowo), kursor „złap” nad bryłą.
7. SEO i udostępnianie: tytuł, opis, JSON-LD, obrazek og z renderu sceny, `llms.txt`. Zdjąć `noindex` dopiero przy wdrożeniu.
8. QA: iPhone i Safari, 1280 i 1440, konsola, kontrast, fokus z klawiatury, ograniczony ruch, wersja bez WebGL.
9. Wdrożenie: podgląd na Vercelu, potem domena interspace.studio po decyzji Roberta.

## 9. Mac: ComfyUI i Blender

Sesja w chmurze nie miała dostępu do Maca (żaden folder nie był udostępniony przez Remote Control). Do zrobienia lokalnie:

- Blender: wyrenderować te same trzy bryły w wysokiej jakości (Cycles) jako obrazek og, plakat zastępczy dla przeglądarek bez WebGL i ewentualnie sekwencję obrotu. Wymiary brył są w `src/shapes.js`.
- ComfyUI: tekstury i zdjęcia do sekcji „dowód” oraz tła do pokazów branżowych. Przed użyciem sprawdzić na Macu, jakie modele są zainstalowane, i dobrać ustawienia pod nie. Tego nie dało się zrobić z chmury.
- Żeby Claude pracował na Macu: sklonować repo, wejść w `interspace/`, uruchomić sesję lokalnie (aplikacja Claude albo `claude` w terminalu) i kazać przeczytać ten plik.

## 10. Koszty i rzeczy poboczne

- Higgsfield: wydane 8,25 kredytu na trzy klatki koncepcyjne (ciemna hala, jezioro we mgle, nitki światła). Odrzucone, nieużyte w stronie. Zostało ok. 563 kredytów. Wideo nie było generowane.
- Rozbiór stron z Awwwards (Obys, Locomotive, Lusion, Basement, Unseen i inne) dał wzorce użyte tutaj: dwa kolory i jeden akcent, nagłówki 8 do 13vw, małe etykiety wersalikami, numerowanie wszystkiego, e-mail zamiast formularza.
- Kod leży w repo profilu GitHub (`robert19001-cmyk/robert19001-cmyk`, folder `interspace/`), bo tylko do niego sesja miała dostęp. Docelowo przenieść do osobnego repo.

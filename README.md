# Retro Tracker

Retro-wojskowy celownik w przeglądarce: kamera wykrywa i śledzi ludzi, odróżnia ich od zwierząt. Zielony fosforowy ekran CRT, radar, dziennik zdarzeń, liczniki i dźwięki.

Wszystko działa lokalnie w przeglądarce (TensorFlow.js + COCO-SSD) - obraz z kamery nigdzie nie jest wysyłany.

## Uruchomienie
Otwórz stronę w Chrome lub Safari na telefonie (wymagane https) i zezwól na kamerę.

## Klawisze
M dźwięk · O obiekty · T paleta zielona/bursztyn · S zrzut PNG · C kamera przód/tył · G siatka · L ślady · F pełny ekran

## Na iPhonie
Otwórz link w Safari (nie w przeglądarce wbudowanej w aplikację typu X/Facebook/Messenger - takie blokują kamerę). Trzymaj telefon poziomo i dotknij „URUCHOM KAMERĘ”.

## Jedna strona, bez przewijania
Układ zawsze mieści się na jednym ekranie (pionowo i poziomo). Przy włączonej blokadzie obrotu użyj przycisku „Obróć HUD” ([H]) - cały interfejs obróci się o 90°. Jeśli obraz z kamery jest wtedy bokiem, dotknij „Obróć obraz” ([V]).

Model COCO-SSD (lite_mobilenet_v2, wagi float16) jest w katalogu `model/` - działa z tego samego serwera, a inferencja idzie w Web Workerze (wasm), więc obraz z kamery nie zacina się.


## v4

- Kamera zawsze na cały ekran, cała reszta to półprzezroczyste nakładki. Dolny pasek: zdjęcie, nagrywanie, zmiana kamery, paleta, dźwięk, menu (ustawienia).
- Dotknij osobę lub zwierzę, żeby je wybrać. Człowiek: „Skanuj twarz” zapisuje twarz pod nazwą, kolejne spotkanie pokazuje `ZNANY: Imię (xx%)` albo `NOWA OSOBA`. Zwierzę: „Skanuj” zapisuje zdjęcie i nazwę (bez rozpoznawania).
- Baza twarzy (przycisk BAZA): podgląd, zmiana nazwy, usuwanie, czyszczenie. Dane są w IndexedDB tej przeglądarki i nigdy nie są wysyłane. Biblioteka: face-api.js (`lib/`, `facemodel/`), ładowana dopiero przy pierwszym skanie, w osobnym workerze (wasm).
- Radar i odległość to **szacunek** (kierunek z położenia w kadrze i przybliżonego FOV ~65°, dystans z wysokości ramki: człowiek ≈ 1,7 m, zwierzęta wg typowych rozmiarów).
- Nagrywanie: MediaRecorder z kompozytu obraz + HUD (mp4 jeśli przeglądarka je wspiera, inaczej webm), maks. 3 min, bez dźwięku. Zapis przez arkusz udostępniania lub pobranie.
- Usunięto: sztuczne AZ/EL, CPU/MEM, BIOS, pasek „zagrożenia”, losowe animacje.

## v5

- Tożsamość celu jest trzymana na śladzie i przenoszona po krótkiej utracie celu (ten sam numer i imię).
- Etykiety osoby: `SKANUJĘ TWARZ…`, `BRAK TWARZY (odwróć się)`, `ZNANY: Imię (xx%)`, `PODOBNY DO: Imię? (xx%)`, `NOWA OSOBA`. Próg twarzy 0.52; pewne dopasowania dodają kolejne wektory do profilu.
- Moduł twarzy ładuje się sam, gdy są zapisane twarze; jeśli worker zawiedzie, wraca na główny wątek (wasm/cpu) z widocznym błędem po polsku i ponawianiem.
- Zwierzęta (oraz ubranie człowieka, gdy nie widać twarzy) rozpoznawane po wyglądzie: MobileNetV2 (`emodel/`, f16, ~4 MB, ładowany leniwie) + podobieństwo kosinusowe. To podobieństwo wyglądu, nie pewna identyfikacja.
- Menu → „Diagnostyka”: status silników, ostatni dystans/podobieństwo, liczba prób, stan pamięci (`navigator.storage.persist()`).

## v6

**Klawisze (v6):** I źródło obrazu · N imię · X celownik · A auto-imiona · +/- zoom (oraz S zdjęcie, R nagrywanie, C kamera, T paleta, M dźwięk, O obiekty, G siatka, L ślady, D radar, B baza, F pełny ekran, H obróć HUD, V obróć obraz).

- **ŹRÓDŁO OBRAZU** (przycisk ŹRÓDŁO / klawisz I):
  - *Kamery* – lista wszystkich `videoinput` (kamery USB, karty HDMI), wybór po `deviceId`, zapamiętany w localStorage, odświeżanie przy `devicechange`; przycisk KAMERA przełącza przód/tył na telefonie, a gdzie indziej przełącza kolejne kamery.
  - *Strumień* – adres HLS (Safari natywnie, gdzie indziej `lib/hls.min.js` – hls.js 1.5.17), WebRTC/WHEP (POST oferty SDP, np. MediaMTX `https://host:8889/ścieżka/whep`) albo plik mp4/webm. Serwer musi wysyłać CORS (`video.crossOrigin='anonymous'`); bez CORS obraz jest widoczny, ale analiza/zdjęcia/nagrywanie są wyłączone (komunikat po polsku). `http://` na stronie https jest blokowane (mixed content; wyjątek: localhost).
  - *Bluetooth* – tylko sterowanie (Web Bluetooth: połącz, bateria, usługi, odczyt/zapis hex/tekst, powiadomienia). Obraz nie przechodzi przez BLE. W Safari/iPhonie niedostępne (Bluefy, iOSWebBLE albo Chrome na Androidzie/komputerze).
- **IMIĘ** (klawisz N): rozpoznawanie człowiek/zwierzę jest automatyczne, ale imię nadajesz przyciskiem na wybranym (albo największym) celu: karta `TO JEST: Imię (xx%)?` → POTWIERDŹ / TO KTOŚ INNY (wpisz imię albo wybierz z listy), lub wpisanie imienia nowej osoby/zwierzęcia. Imię zostaje na celu i wraca po krótkiej utracie. Dawne auto-podpisywanie to opcja „Auto-rozpoznawanie imion” (domyślnie wyłączona).
- **Zapis twarzy z kilku ujęć**: skan z podpowiedziami (PATRZ PROSTO / LEKKO W LEWO / W PRAWO / W GÓRĘ / W DÓŁ), `SKAN i/5`, min. 3 ujęcia (potem ostrzeżenie), tylko ostre i dość duże twarze (score ≥ 0.6, ≥ 48 px), bez prawie identycznych ujęć (odległość ≥ 0.10). Rozpoznanie: próg `KNOWN_D` **0.45** (było 0.52), margines ≥ **0.06** nad drugim profilem, zgodność w **2** kolejnych klatkach; inaczej `NIEZNANY`. Twarz jest przypisywana celowi tylko jeśli jej środek leży w ramce tego celu.
- **Celownik** (Menu → Celownik, klawisz X; domyślnie włączony): Klasyczny (jak w v1: ramiona 22–44 px), Krzyż, Kropka, Pierścień z podziałką, Nawiasy. SVG, działa z obróconym HUD, jest na zdjęciach i nagraniach.
- **Gładkie śledzenie**: render co klatkę ekranu z interpolacją między detekcjami, filtr One Euro + predykcja prędkości, zanikanie/pojawianie się, animacja „lock-on”, linia skanująca na wybranym celu, opcjonalny ślad. W testach drgania drugiej różnicy położenia ramki spadły ok. 9–12× względem v5.
- **Zoom 1×–10×** (suwak z boku, skala logarytmiczna, płynne dochodzenie): najpierw zoom sprzętowy kamery (do jej maksimum), potem cyfrowy; podwójne stuknięcie w wartość = 1×. Detekcja działa na przybliżonym wycinku.
- **Jakość obrazu**: `<video>` wyświetlany bezpośrednio pod przezroczystym HUD (pełna rozdzielczość), zielony filtr przez CSS; strumień bazowy 1920×1080 (fallback 1280×720); przy zoomie cyfrowym > ~2× (z opóźnieniem 0,7 s) prosi o 4K, wraca do 1080p po ~3 s poniżej 1,5×. Rozdzielczość widać w Menu → Diagnostyka.
- **Ikona i PWA**: `icons/` (SVG z animowaną linią skanującą + PNG 16/32/180/192/512/maskable), `manifest.webmanifest`.
- **Offline**: `sw.js` (Service Worker) przechowuje całą aplikację (HTML, ikony, czcionka VT323, TF.js + WASM, hls.js, face-api – wszystko hostowane lokalnie w `lib/`, `fonts/`). Modele (`model/`, `emodel/`, `facemodel/`) trafiają do osobnej pamięci `rt-models-v1` przy pierwszym udanym pobraniu albo przyciskiem Menu → **POBIERZ MODELE OFFLINE** (z paskiem postępu). Po pobraniu modeli cała analiza (wykrywanie, twarze, wygląd) działa bez internetu. Bez sieci i bez modelu kamera, HUD, radar, zoom, celownik, menu źródeł i diagnostyka działają, a AI pokazuje `AI: WYMAGA SIECI (MODEL NIE POBRANY)` (IMIĘ wyjaśnia dlaczego); po powrocie sieci model ładuje się sam. Wskaźnik ONLINE/OFFLINE jest u góry, a Diagnostyka pokazuje stan Service Workera, wersję pamięci i które modele są pobrane. Strumienie HLS/WHEP z internetu naturalnie potrzebują sieci. Nowa wersja instaluje się w tle i czeka: pojawia się pasek `NOWA WERSJA — DOTKNIJ, BY ODŚWIEŻYĆ`. Nazwa pamięci aplikacji (`rt-shell-v6-<hash>`) zmienia się automatycznie z każdą zmianą `index.html` (skrypt budujący); stare pamięci są usuwane, pamięć modeli zostaje.

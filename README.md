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

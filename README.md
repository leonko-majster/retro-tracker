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

# AQUA Product Configurator – FSD Lab

`index.html` and `style.css` are unchanged – same look, same product, same features.
Only `script.js` (now jQuery) and `server.js` (Express) were updated.

## Run
```
npm install
npm start          # backend on http://localhost:3000
```
Open the app at **http://localhost:3000** (served by Express) or through VS Code Live Server (CORS is enabled for other ports).

## Q1 – jQuery (script.js)
All controls, messages and DOM updates now use jQuery instead of `document.getElementById` / `addEventListener`.

| Traditional JS | jQuery used |
|---|---|
| `getElementById("x")` | `$("#x")`, `$(".class")`, `$("#a .b")` |
| `addEventListener("click", …)` | `.on("click", …)`, `.on("mousedown keydown", …)` |
| `el.value` | `.val()` |
| `el.textContent = …` | `.text()` |
| `el.innerHTML = …` | `.html()` |
| `el.classList.add/remove/toggle` | `.addClass() / .removeClass() / .toggleClass()` |
| `el.style.setProperty` | `.css()` |
| `el.dataset.color` | `.data("color")` |
| `el.hidden = true` | `.prop("hidden", true)` |
| `createElement` / `cloneNode` / `appendChild` | `$("<div>")`, `.clone()`, `.append()` |

Real-time preview updates: colour, size (+price), lid, engraving + font, glow/metal, live card preview.

## Q2 – Public API (jQuery AJAX GET)
Click **Load Product from Public API** → `$.ajax GET https://dummyjson.com/products/1`.
Name, price, category, image and description are rendered dynamically.
Failures (offline, timeout, HTTP error) are handled in `.fail()` and shown on the page.
DevTools → Network → Fetch/XHR shows the request and JSON response.

## Q3 – Node + Express
- **GET Local Product**: `Frontend → $.ajax GET /api/product → Express → JSON → Frontend`
- **POST Configuration** (choose a size first): `JS object → JSON.stringify → $.ajax POST /api/configurations → req.body → JSON response → Frontend`

Middleware in `server.js`: `cors()`, `express.json()`, a custom logger (method + URL + status + time), and a JSON error handler.
The backend terminal prints each request and the received `req.body`.

> The premium payment is a simulation. Do not enter real payment information.

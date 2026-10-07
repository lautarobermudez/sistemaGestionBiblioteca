# Library Management System

A library loan manager in **HTML, CSS and vanilla JavaScript**. It registers book loans, processes returns, calculates late fees and shows daily statistics. Data is saved in the browser with `localStorage`.

Practice project for the JavaScript course (functions, arrays, objects, forms, `localStorage`).

## Features
- Register loans with a due date.
- Process returns and calculate late fees.
- Daily statistics (loans, returns, fees).
- List of active loans.

## Run it locally
No build step: clone the repo and open `index.html` in a browser.

## Structure
```
index.html
styles/styles.css
scripts/app.js                 # browser version (used by index.html)
scripts/gestionBiblioteca.js   # earlier console version for Node (readline)
```

## Known limitations / next steps
- No backend: data is only stored in the browser.
- Two versions of the logic coexist (console and browser); they should share one module.
- No tests.

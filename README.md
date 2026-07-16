# Aiden — Signal Garden

A living field notebook for ideas, experiments, builds, and observations. The first version is a dependency-free static site with responsive layouts, signal filtering, optional generated atmosphere, and reduced-motion support.

## Run locally

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

Pushes to `main` deploy through the GitHub Pages workflow in `.github/workflows/pages.yml`. In repository settings, Pages should use **GitHub Actions** as its source.

# APAC Chef Program — Meet our Top Chefs Slider

Self-contained, mobile-responsive chef card slider component.

## Files

```
apac-chef-slider/
├── index.html          # Demo page with slider markup
├── styles.css          # Component styles (responsive)
├── slider.js           # Slider behaviour (arrows, dots, touch)
├── images/
│   └── chef-lee-man-sing.jpg   # Chef portrait (864×1152, 3:4)
└── README.md
```

## Quick start

```bash
cd apac-chef-slider
python3 -m http.server 8080
```

Open http://localhost:8080 in Chrome or Edge.

## Component structure

| Element | Class / attribute |
| --- | --- |
| Section | `.chef-section` |
| Heading | `.chef-section__heading` |
| Description | `.chef-section__description` |
| Slider | `[data-chef-slider]` |
| Card | `.chef-card` |
| Chef name | `.chef-card__name` |
| Country | `.chef-card__country` |
| Bio | `.chef-card__bio` |

## Responsive breakpoints

| Screen | Cards visible | Navigation |
| --- | --- | --- |
| Desktop (>1024px) | 4 | Arrows + dots |
| Tablet (641–1024px) | 2 | Arrows + dots |
| Mobile (≤640px) | ~1 + peek | Touch swipe + dots |

## Chef image spec

- **Aspect ratio:** 3:4 (portrait)
- **Recommended size:** 864×1152 px (or 480×640 px minimum)
- Replace `images/chef-lee-man-sing.jpg` and update card markup in `index.html`

## Adding more chefs

Duplicate a `<li class="chef-card">` block inside `.chef-slider__track` and update the image, name, country, and bio. The slider supports up to 7 cards (4 visible on desktop).

## Integration

Copy the `<section class="chef-section">` block from `index.html`, plus `styles.css` and `slider.js`, into your site. No dependencies required.

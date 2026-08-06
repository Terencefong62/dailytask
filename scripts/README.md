# Scripts

Python utilities for LKK corporate site and content work. Run from the repository root.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Scripts

| Script | Purpose |
| --- | --- |
| `crawl_lkk_meta.py` | Crawl preview-web.lkk.com sitemaps and export URL, title, and meta description to CSV |
| `extract_employee_names.py` | Extract employee display names from LKK employee story pages |
| `update_employee_meta_excel.py` | Update employee meta titles/descriptions and export Excel with optimized columns |
| `process_lee_kum_kee_images.py` | Split a 3-panel composite image and export each panel at 1600×900 |

## Examples

```bash
# Crawl site meta tags
python scripts/crawl_lkk_meta.py

# Extract employee names (prints to stdout)
python scripts/extract_employee_names.py

# Update employee meta in Excel (reads exports/lkk_meta_crawl.csv)
python scripts/update_employee_meta_excel.py

# Process recruitment composite image
python scripts/process_lee_kum_kee_images.py path/to/composite.png -o exports/
```

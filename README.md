# dailytask

Daily task workspace for image exports and ingredient ranking work.

## Setup

Requires Python 3.12+.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

On Debian/Ubuntu, install the venv package first if needed:

```bash
sudo apt-get install -y python3.12-venv
```

## Image export script

```bash
source .venv/bin/activate
python scripts/process_lee_kum_kee_images.py path/to/composite.png -o exports
```

"""
Display images for the desktop remarketing campaign (06-desktop-remarketing.md).

Google's responsive display ads want a landscape image (1.91:1, 1200x628), a
square image (1:1, 1200x1200), a square logo and a 4:1 logo. This draws them
from the two brand assets the marketing site already serves, so the ad looks
like the site: white ground, the bull, one line of type, a green button.

Inputs (downloaded from www.apexapplications.io, see fetch() below) and
outputs land in marketing/google-ads/creative/. Re-run after a copy change:

    python3 creative.py
"""

import os
import urllib.request

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "creative")
SITE = "https://www.apexapplications.io/__l5e/assets-v1/"
ASSETS = {
    "apex-bull-logo.png": "e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png",
    "purchase-orders.png": "68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png",
}

INK = (17, 24, 39)        # the site's near-black
MUTED = (75, 85, 99)
GREEN = (22, 163, 74)     # Apex green button
WHITE = (255, 255, 255)
FONT = "/System/Library/Fonts/Helvetica.ttc"

HEADLINE = "Connect\nSeller Central\nin 2 minutes"
SUB = "You already have the account.\nThis is the one step left."
CTA = "Connect now"


def fetch(name):
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        req = urllib.request.Request(SITE + ASSETS[name], headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return Image.open(path).convert("RGBA")


def font(size, bold=False):
    # Helvetica.ttc: index 0 regular, 1 bold on macOS.
    return ImageFont.truetype(FONT, size, index=1 if bold else 0)


def fit(im, box):
    im = im.copy()
    im.thumbnail(box, Image.LANCZOS)
    return im


def button(draw, xy, text, size):
    x, y = xy
    f = font(size, bold=True)
    tw = draw.textlength(text, font=f)
    pad_x, pad_y = int(size * 0.9), int(size * 0.55)
    draw.rounded_rectangle([x, y, x + tw + 2 * pad_x, y + size + 2 * pad_y], radius=size, fill=GREEN)
    draw.text((x + pad_x, y + pad_y - size * 0.08), text, font=f, fill=WHITE)


def landscape(bull, shot):
    im = Image.new("RGBA", (1200, 628), WHITE)
    d = ImageDraw.Draw(im)
    logo = fit(bull, (150, 92))
    im.alpha_composite(logo, (64, 48))
    d.multiline_text((64, 160), HEADLINE, font=font(58, bold=True), fill=INK, spacing=6)
    d.multiline_text((64, 386), SUB, font=font(24), fill=MUTED, spacing=6)
    button(d, (64, 476), CTA, 28)
    # Dashboard screenshot on the right, cropped to its left edge so the
    # table reads, with a soft shadow so it sits on the white.
    crop = shot.crop((0, 0, 900, 620))
    crop = fit(crop, (500, 344))
    shadow = Image.new("RGBA", (crop.width + 40, crop.height + 40), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([20, 24, crop.width + 20, crop.height + 24], radius=18, fill=(0, 0, 0, 40))
    im.alpha_composite(shadow, (676, 180))
    im.alpha_composite(crop, (696, 192))
    return im


def square(bull, shot):
    im = Image.new("RGBA", (1200, 1200), WHITE)
    d = ImageDraw.Draw(im)
    logo = fit(bull, (200, 122))
    im.alpha_composite(logo, (80, 72))
    d.multiline_text((80, 220), HEADLINE, font=font(92, bold=True), fill=INK, spacing=10)
    d.multiline_text((80, 560), SUB, font=font(34), fill=MUTED, spacing=8)
    button(d, (80, 660), CTA, 40)
    crop = fit(shot.crop((0, 0, 1621, 620)), (1040, 398))
    im.alpha_composite(crop, (80, 790))
    return im


def logo_square(bull):
    im = Image.new("RGBA", (1200, 1200), WHITE)
    logo = fit(bull, (900, 544))
    im.alpha_composite(logo, ((1200 - logo.width) // 2, (1200 - logo.height) // 2))
    return im


def logo_wide(bull):
    im = Image.new("RGBA", (1200, 300), WHITE)
    d = ImageDraw.Draw(im)
    logo = fit(bull, (330, 200))
    im.alpha_composite(logo, (60, 50))
    d.text((430, 96), "APEX APPLICATIONS", font=font(72, bold=True), fill=INK)
    return im


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    bull, shot = fetch("apex-bull-logo.png"), fetch("purchase-orders.png")
    for name, img in {
        "rmkt-1200x628.png": landscape(bull, shot),
        "rmkt-1200x1200.png": square(bull, shot),
        "logo-1200x1200.png": logo_square(bull),
        "logo-1200x300.png": logo_wide(bull),
    }.items():
        img.convert("RGB").save(os.path.join(OUT, name), optimize=True)
        print(f"  {name}")

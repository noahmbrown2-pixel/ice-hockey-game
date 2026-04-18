"""
Roblox Shirt Template Generator - Soccer Jersey Style
Creates a 585x559 PNG template for "OTTERSON 8" jersey
Option 1: Generic inspired version (no copyrighted logos)
"""

from PIL import Image, ImageDraw, ImageFont
import math

# Template dimensions
WIDTH = 585
HEIGHT = 559

# Color palette
WHITE = (255, 255, 255, 255)
NAVY = (25, 42, 86, 255)
RED = (227, 34, 48, 255)
LIGHT_GRAY = (240, 240, 245, 255)
PATTERN_GRAY = (230, 230, 238, 255)

def create_geometric_pattern(draw, x, y, w, h):
    """Creates subtle geometric triangle pattern"""
    pattern_size = 40
    for py in range(y, y + h, pattern_size):
        for px in range(x, x + w, pattern_size):
            # Draw subtle triangles
            points = [
                (px, py),
                (px + pattern_size, py),
                (px + pattern_size//2, py + pattern_size)
            ]
            draw.polygon(points, fill=PATTERN_GRAY, outline=None)

def draw_stripes(draw, x, y, w, h, horizontal=True):
    """Draw red and navy horizontal stripes"""
    stripe_height = 8
    # Navy stripe
    if horizontal:
        draw.rectangle([x, y, x + w, y + stripe_height], fill=NAVY)
        # Red stripe
        draw.rectangle([x, y + stripe_height, x + w, y + stripe_height * 2], fill=RED)
    else:
        draw.rectangle([x, y, x + stripe_height, y + h], fill=NAVY)
        draw.rectangle([x + stripe_height, y, x + stripe_height * 2, y + h], fill=RED)

def draw_generic_swoosh(draw, x, y, size=30):
    """Draw a generic swoosh-like shape (not Nike)"""
    # Simple curved swoosh alternative
    points = [
        (x, y + size//2),
        (x + size//3, y + size//3),
        (x + size, y),
        (x + size, y + size//6),
        (x + size//3, y + size//2),
        (x, y + size//1.5)
    ]
    draw.polygon(points, fill=RED)

def draw_generic_crest(draw, x, y, size=50):
    """Draw a generic shield crest (not USA Soccer)"""
    # Shield outline
    shield_points = [
        (x + size//2, y),
        (x + size, y + size//4),
        (x + size, y + size*0.6),
        (x + size//2, y + size),
        (x, y + size*0.6),
        (x, y + size//4)
    ]
    draw.polygon(shield_points, fill=WHITE, outline=NAVY, width=3)

    # Stars above shield
    for i in range(3):
        star_x = x + (i * size//3) + size//6
        star_y = y - 10
        draw_star(draw, star_x, star_y, 4, NAVY)

    # Stripes inside shield
    for i in range(3):
        stripe_y = y + size//3 + (i * 8)
        draw.rectangle([x + 5, stripe_y, x + size - 5, stripe_y + 4], fill=RED)

def draw_star(draw, x, y, size, color):
    """Draw a simple star shape"""
    points = []
    for i in range(5):
        angle = math.pi * 2 * i / 5 - math.pi / 2
        points.append((x + size * math.cos(angle), y + size * math.sin(angle)))
    draw.polygon(points, fill=color)

def draw_sleeve_badge(draw, x, y, size=40):
    """Draw a generic team badge (not MLS NEXT)"""
    # Shield shape
    shield_points = [
        (x + size//2, y),
        (x + size, y + size//5),
        (x + size, y + size*0.7),
        (x + size//2, y + size),
        (x, y + size*0.7),
        (x, y + size//5)
    ]
    draw.polygon(shield_points, fill=NAVY, outline=WHITE, width=2)

    # Lightning bolt or star accent
    bolt_x = x + size//2
    bolt_y = y + size//3
    draw.polygon([
        (bolt_x, bolt_y),
        (bolt_x + 10, bolt_y + 10),
        (bolt_x + 5, bolt_y + 10),
        (bolt_x + 8, bolt_y + 20),
        (bolt_x - 2, bolt_y + 8),
        (bolt_x + 3, bolt_y + 8)
    ], fill=(100, 200, 255, 255))

# Create the image
img = Image.new('RGBA', (WIDTH, HEIGHT), WHITE)
draw = ImageDraw.Draw(img)

# Roblox shirt template layout guide:
# Front torso: roughly x=128-256, y=130-245
# Back torso: roughly x=320-448, y=130-245
# Left arm: x=64-128, y=130-325
# Right arm: x=256-320, y=130-325
# Neck area: around x=192, y=100

# === BACKGROUND PATTERN ===
# Apply subtle geometric pattern to upper torso areas
create_geometric_pattern(draw, 100, 100, 400, 150)

# === COLLAR (Navy with red trim) ===
# Front collar
draw.ellipse([180, 95, 220, 135], fill=NAVY)
# Red trim on collar
draw.arc([180, 95, 220, 135], 0, 180, fill=RED, width=3)

# === ARM STRIPES ===
# Left arm stripes
draw_stripes(draw, 64, 200, 64, 16)
# Right arm stripes
draw_stripes(draw, 256, 200, 64, 16)

# === FRONT DESIGN ===
# Generic swoosh (upper left chest)
draw_generic_swoosh(draw, 140, 145, 25)

# Generic USA-style crest (upper center)
draw_generic_crest(draw, 175, 140, 45)

# === SLEEVE BADGES ===
# Right sleeve badge
draw_sleeve_badge(draw, 270, 160, 35)

# === TEXT - FRONT (OTTERSON 8) ===
# Try to use a bold font, fallback to default
try:
    # Try common Windows fonts
    font_large = ImageFont.truetype("arialbd.ttf", 48)
    font_medium = ImageFont.truetype("arialbd.ttf", 28)
except:
    try:
        font_large = ImageFont.truetype("Arial.ttf", 48)
        font_medium = ImageFont.truetype("Arial.ttf", 28)
    except:
        # Fallback to default
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()

# "OTTERSON" text on upper front
text_otterson = "OTTERSON"
bbox = draw.textbbox((0, 0), text_otterson, font=font_medium)
text_width = bbox[2] - bbox[0]
draw.text((192 - text_width//2, 265), text_otterson, fill=NAVY, font=font_medium)

# Number "8" on center front (large)
text_number = "8"
bbox = draw.textbbox((0, 0), text_number, font=font_large)
text_width = bbox[2] - bbox[0]
draw.text((192 - text_width//2, 295), text_number, fill=NAVY, font=font_large)

# === BACK DESIGN ===
# Back upper text "OTTERSON"
text_otterson = "OTTERSON"
bbox = draw.textbbox((0, 0), text_otterson, font=font_medium)
text_width = bbox[2] - bbox[0]
draw.text((384 - text_width//2, 140), text_otterson, fill=NAVY, font=font_medium)

# Back number "8" (large)
text_number = "8"
bbox = draw.textbbox((0, 0), text_number, font=font_large)
text_width = bbox[2] - bbox[0]
draw.text((384 - text_width//2, 170), text_number, fill=NAVY, font=font_large)

# Save the template
output_path = "otterson_8_roblox_shirt.png"
img.save(output_path, "PNG")
print(f"[SUCCESS] Shirt template created: {output_path}")
print(f"[SUCCESS] Dimensions: {WIDTH}x{HEIGHT} pixels")
print(f"[SUCCESS] Ready to upload to Roblox!")
print(f"\nNext steps:")
print(f"1. Open the file: {output_path}")
print(f"2. Go to create.roblox.com")
print(f"3. Navigate to Avatar Items > Classics > Shirt")
print(f"4. Upload this PNG file")
print(f"5. Pay 10 Robux and submit!")

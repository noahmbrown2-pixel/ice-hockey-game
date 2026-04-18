"""
Roblox Shirt Template Generator - 5 Versions
Creates 5 variations of OTTERSON 8 jersey matching the reference design
"""

from PIL import Image, ImageDraw, ImageFont
import random
import math

# Template dimensions
WIDTH = 585
HEIGHT = 559

# Color palette (matching reference jersey)
WHITE = (255, 255, 255, 255)
NAVY = (25, 42, 86, 255)
RED = (227, 34, 48, 255)
LIGHT_BLUE = (220, 230, 240, 255)
PATTERN_BLUE_1 = (230, 235, 242, 255)
PATTERN_BLUE_2 = (210, 220, 235, 255)
PATTERN_BLUE_3 = (200, 215, 230, 255)

def draw_generic_swoosh(draw, x, y, size=25):
    """Draw a generic swoosh-like shape"""
    points = [
        (x, y + size//2),
        (x + size//3, y + size//3),
        (x + size, y),
        (x + size, y + size//6),
        (x + size//3, y + size//2),
        (x, y + size//1.5)
    ]
    draw.polygon(points, fill=RED)

def draw_generic_crest(draw, x, y, size=45):
    """Draw a generic USA-style shield crest"""
    # Shield outline
    shield_points = [
        (x + size//2, y),
        (x + size, y + size//4),
        (x + size, y + size*0.6),
        (x + size//2, y + size),
        (x, y + size*0.6),
        (x, y + size//4)
    ]
    draw.polygon(shield_points, fill=WHITE, outline=NAVY, width=2)

    # Stars above shield
    for i in range(3):
        star_x = x + (i * size//3) + size//6
        star_y = y - 8
        draw_star(draw, star_x, star_y, 3, NAVY)

    # Stripes inside shield
    for i in range(4):
        stripe_y = y + size//2 + (i * 5)
        draw.rectangle([x + 8, stripe_y, x + size - 8, stripe_y + 2], fill=RED)

def draw_star(draw, x, y, size, color):
    """Draw a simple star shape"""
    points = []
    for i in range(5):
        angle = math.pi * 2 * i / 5 - math.pi / 2
        points.append((x + size * math.cos(angle), y + size * math.sin(angle)))
    draw.polygon(points, fill=color)

def create_version_1_angular(img, draw):
    """Version 1: Angular geometric pattern - sharp diagonal shapes"""
    random.seed(42)
    for i in range(60):
        x = random.randint(100, 500)
        y = random.randint(100, 350)
        size = random.randint(30, 80)
        angle = random.choice([30, 45, 60, 120, 135, 150])

        color = random.choice([PATTERN_BLUE_1, PATTERN_BLUE_2, PATTERN_BLUE_3])

        # Create angular shape
        points = [
            (x, y),
            (x + size * math.cos(math.radians(angle)), y + size * math.sin(math.radians(angle))),
            (x + size * math.cos(math.radians(angle + 60)), y + size * math.sin(math.radians(angle + 60)))
        ]
        draw.polygon(points, fill=color, outline=None)

def create_version_2_faceted(img, draw):
    """Version 2: Faceted/low-poly style pattern"""
    random.seed(123)
    for i in range(50):
        x = random.randint(100, 500)
        y = random.randint(100, 350)
        size = random.randint(40, 90)

        color = random.choice([PATTERN_BLUE_1, PATTERN_BLUE_2, PATTERN_BLUE_3])

        # Create irregular polygon (faceted look)
        num_points = random.randint(3, 5)
        points = []
        for j in range(num_points):
            angle = (2 * math.pi * j / num_points) + random.uniform(-0.3, 0.3)
            r = size + random.randint(-15, 15)
            points.append((
                x + r * math.cos(angle),
                y + r * math.sin(angle)
            ))
        draw.polygon(points, fill=color, outline=None)

def create_version_3_polygonal(img, draw):
    """Version 3: Abstract polygonal pattern with varied opacity"""
    random.seed(456)
    for i in range(70):
        x = random.randint(100, 500)
        y = random.randint(100, 350)
        size = random.randint(25, 70)

        # Vary the blue shades more
        r = random.randint(200, 235)
        g = random.randint(215, 240)
        b = random.randint(230, 245)
        color = (r, g, b, 255)

        # Create hexagonal shapes
        points = []
        for j in range(6):
            angle = math.pi * 2 * j / 6
            points.append((
                x + size * math.cos(angle),
                y + size * math.sin(angle)
            ))
        draw.polygon(points, fill=color, outline=None)

def create_version_4_gradient(img, draw):
    """Version 4: Gradient geometric with softer transitions"""
    random.seed(789)
    # Larger shapes with gradient-like placement
    for i in range(45):
        x = random.randint(100, 500)
        y = random.randint(100, 350)
        size = random.randint(50, 100)

        # Create gradient effect based on position
        intensity = int(((y - 100) / 250) * 30)
        color = (220 + intensity, 225 + intensity, 235 + intensity, 255)

        # Diamond shapes
        points = [
            (x, y - size//2),
            (x + size//2, y),
            (x, y + size//2),
            (x - size//2, y)
        ]
        draw.polygon(points, fill=color, outline=None)

def create_version_5_dense(img, draw):
    """Version 5: Dense angular pattern - more complex"""
    random.seed(321)
    for i in range(90):
        x = random.randint(100, 500)
        y = random.randint(100, 350)
        size = random.randint(20, 60)

        color = random.choice([PATTERN_BLUE_1, PATTERN_BLUE_2, PATTERN_BLUE_3, LIGHT_BLUE])

        # Create triangular shapes at various angles
        angle = random.randint(0, 360)
        points = []
        for j in range(3):
            a = math.radians(angle + (j * 120))
            points.append((
                x + size * math.cos(a),
                y + size * math.sin(a)
            ))
        draw.polygon(points, fill=color, outline=None)

def add_common_elements(draw, font_medium, font_large):
    """Add elements common to all versions"""
    # === COLLAR (Navy with red trim) ===
    draw.ellipse([182, 95, 218, 130], fill=NAVY)
    draw.arc([180, 93, 220, 133], 180, 360, fill=RED, width=3)

    # === SLEEVE CUFFS (Navy with red band) ===
    # Left sleeve cuff
    draw.rectangle([64, 210, 128, 225], fill=NAVY)
    draw.rectangle([64, 225, 128, 228], fill=RED)

    # Right sleeve cuff
    draw.rectangle([256, 210, 320, 225], fill=NAVY)
    draw.rectangle([256, 225, 320, 228], fill=RED)

    # === FRONT DESIGN ===
    # Generic swoosh (upper left chest)
    draw_generic_swoosh(draw, 138, 145, 22)

    # Generic USA-style crest (upper right chest)
    draw_generic_crest(draw, 178, 140, 42)

    # === TEXT - FRONT ===
    # "OTTERSON" text
    text_otterson = "OTTERSON"
    bbox = draw.textbbox((0, 0), text_otterson, font=font_medium)
    text_width = bbox[2] - bbox[0]
    draw.text((192 - text_width//2, 270), text_otterson, fill=NAVY, font=font_medium)

    # Number "8"
    text_number = "8"
    bbox = draw.textbbox((0, 0), text_number, font=font_large)
    text_width = bbox[2] - bbox[0]
    draw.text((192 - text_width//2, 300), text_number, fill=NAVY, font=font_large)

    # === BACK DESIGN ===
    # Back "OTTERSON"
    bbox = draw.textbbox((0, 0), text_otterson, font=font_medium)
    text_width = bbox[2] - bbox[0]
    draw.text((384 - text_width//2, 140), text_otterson, fill=NAVY, font=font_medium)

    # Back number "8"
    bbox = draw.textbbox((0, 0), text_number, font=font_large)
    text_width = bbox[2] - bbox[0]
    draw.text((384 - text_width//2, 170), text_number, fill=NAVY, font=font_large)

# Load fonts
try:
    font_large = ImageFont.truetype("arialbd.ttf", 48)
    font_medium = ImageFont.truetype("arialbd.ttf", 26)
except:
    try:
        font_large = ImageFont.truetype("Arial.ttf", 48)
        font_medium = ImageFont.truetype("Arial.ttf", 26)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()

# Generate all 5 versions
versions = [
    ("Version 1 - Angular Geometric", create_version_1_angular),
    ("Version 2 - Faceted Low-Poly", create_version_2_faceted),
    ("Version 3 - Abstract Polygonal", create_version_3_polygonal),
    ("Version 4 - Gradient Geometric", create_version_4_gradient),
    ("Version 5 - Dense Angular", create_version_5_dense)
]

print("Generating 5 Roblox shirt template versions...")
print("=" * 60)

for idx, (name, pattern_func) in enumerate(versions, 1):
    # Create base image
    img = Image.new('RGBA', (WIDTH, HEIGHT), WHITE)
    draw = ImageDraw.Draw(img)

    # Apply pattern
    pattern_func(img, draw)

    # Add common elements
    add_common_elements(draw, font_medium, font_large)

    # Save
    filename = f"otterson_8_version_{idx}.png"
    img.save(filename, "PNG")
    print(f"[{idx}/5] {name}")
    print(f"       Saved as: {filename}")

print("=" * 60)
print("[SUCCESS] All 5 versions created successfully!")
print("\nFiles created:")
for i in range(1, 6):
    print(f"  - otterson_8_version_{i}.png")

from PIL import Image, ImageDraw, ImageFont
import math

# Create image with Roblox shirt template dimensions
width, height = 585, 559
img = Image.new('RGB', (width, height), color='#808080')  # Neutral gray background
draw = ImageDraw.Draw(img)

# Define shirt template sections (approximate standard Roblox layout)
# Front section
front_x, front_y = 128, 130
front_width, front_height = 128, 130

# Back section
back_x, back_y = 256, 130
back_width, back_height = 128, 130

# Left sleeve (on the right side of template - it's mirrored)
left_sleeve_x, left_sleeve_y = 0, 130
left_sleeve_width, left_sleeve_height = 128, 130

# Right sleeve (on the left side of template)
right_sleeve_x, right_sleeve_y = 384, 130
right_sleeve_width, right_sleeve_height = 128, 130

# Up section (collar/top)
up_x, up_y = 128, 0
up_width, up_height = 128, 130

# Down section (bottom hem)
down_x, down_y = 128, 260
down_width, down_height = 128, 130

# Base white color for the shirt
shirt_white = '#FFFFFF'
lavender_purple = '#C8B5E0'  # Light lavender/purple

# Fill all sections with white base
sections = [
    (front_x, front_y, front_width, front_height),
    (back_x, back_y, back_width, back_height),
    (left_sleeve_x, left_sleeve_y, left_sleeve_width, left_sleeve_height),
    (up_x, up_y, up_width, up_height),
    (down_x, down_y, down_width, down_height),
    (right_sleeve_x, right_sleeve_y, right_sleeve_width, right_sleeve_height)
]

for x, y, w, h in sections:
    draw.rectangle([x, y, x + w, y + h], fill=shirt_white)

# Function to draw angular geometric patterns
def draw_angular_pattern(draw, x_offset, y_offset, w, h, color):
    """Draw angular geometric patterns like modern soccer jerseys"""
    # Diagonal stripes
    stripe_width = 15
    for i in range(-h, w + h, stripe_width * 2):
        points = [
            (x_offset + i, y_offset),
            (x_offset + i + stripe_width, y_offset),
            (x_offset + i + stripe_width - h, y_offset + h),
            (x_offset + i - h, y_offset + h)
        ]
        draw.polygon(points, fill=color)

    # Add some angular accents on shoulders/chest
    # Triangle patterns on upper section
    triangle_points = [
        (x_offset + w//4, y_offset),
        (x_offset + w//2, y_offset + 30),
        (x_offset + w//4 - 20, y_offset)
    ]
    draw.polygon(triangle_points, fill=color)

    triangle_points2 = [
        (x_offset + 3*w//4, y_offset),
        (x_offset + w//2, y_offset + 30),
        (x_offset + 3*w//4 + 20, y_offset)
    ]
    draw.polygon(triangle_points2, fill=color)

# Apply patterns to FRONT
draw_angular_pattern(draw, front_x, front_y, front_width, front_height, lavender_purple)

# Apply patterns to BACK
draw_angular_pattern(draw, back_x, back_y, back_width, back_height, lavender_purple)

# Apply patterns to UP (collar area)
draw_angular_pattern(draw, up_x, up_y, up_width, up_height, lavender_purple)

# Apply patterns to DOWN (bottom hem)
draw_angular_pattern(draw, down_x, down_y, down_width, down_height, lavender_purple)

# SHORT SLEEVES ONLY - fill only top half of sleeve sections
# Left sleeve (short sleeve - top half only)
sleeve_short_height = left_sleeve_height // 2
draw.rectangle([left_sleeve_x, left_sleeve_y, left_sleeve_x + left_sleeve_width,
                left_sleeve_y + sleeve_short_height], fill=shirt_white)
draw_angular_pattern(draw, left_sleeve_x, left_sleeve_y, left_sleeve_width,
                     sleeve_short_height, lavender_purple)

# Right sleeve (short sleeve - top half only)
draw.rectangle([right_sleeve_x, right_sleeve_y, right_sleeve_x + right_sleeve_width,
                right_sleeve_y + sleeve_short_height], fill=shirt_white)
draw_angular_pattern(draw, right_sleeve_x, right_sleeve_y, right_sleeve_width,
                     sleeve_short_height, lavender_purple)

# Add labels to sections (optional - for reference)
try:
    # Try to use a default font, if not available, use default
    font = ImageFont.truetype("arial.ttf", 16)
except:
    font = ImageFont.load_default()

# Label positions
labels = [
    ("FRONT", front_x + front_width//2 - 25, front_y + front_height//2),
    ("BACK", back_x + back_width//2 - 20, back_y + back_height//2),
    ("LEFT", left_sleeve_x + left_sleeve_width//2 - 20, left_sleeve_y + 20),
    ("RIGHT", right_sleeve_x + right_sleeve_width//2 - 25, right_sleeve_y + 20),
    ("UP", up_x + up_width//2 - 10, up_y + up_height//2),
    ("DOWN", down_x + down_width//2 - 25, down_y + down_height//2)
]

# Draw labels in contrasting color
for label_text, label_x, label_y in labels:
    # Draw text outline for visibility
    for adj in range(-1, 2):
        for adj2 in range(-1, 2):
            draw.text((label_x + adj, label_y + adj2), label_text, fill='#000000', font=font)
    draw.text((label_x, label_y), label_text, fill='#FFFFFF', font=font)

# Save the image
img.save('roblox_soccer_shirt_template.png')
print("✓ Roblox shirt template created: roblox_soccer_shirt_template.png")
print(f"  Dimensions: {width}x{height} pixels")
print("  Style: Modern soccer jersey with white base and lavender/purple patterns")
print("  Short sleeves only")
print("\nUpload this template to Roblox Studio to use as a classic shirt!")

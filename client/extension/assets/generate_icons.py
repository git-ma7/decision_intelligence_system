#!/usr/bin/env python3
"""Generate placeholder icons for the extension"""

from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    """Create a simple icon with 'DI' text"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)
    
    # Add white text 'DI'
    font_size = int(size * 0.6)
    try:
        # Try to use a system font
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    text = "DI"
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save
    img.save(filename)
    print(f"Created {filename}")

if __name__ == '__main__':
    import os
    assets_dir = '/home/mns/Documents/dec_int_sys/client/extension/assets'
    
    create_icon(128, os.path.join(assets_dir, 'icon-128.png'))
    create_icon(48, os.path.join(assets_dir, 'icon-48.png'))
    create_icon(16, os.path.join(assets_dir, 'icon-16.png'))

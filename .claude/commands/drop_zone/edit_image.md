# Edit Image Command

## Purpose
Edit existing images using AI-powered image editing models via Replicate API.

## Variables
- `[[FILE_PATH]]` - The absolute path to the file containing editing instructions

## Task
Process image editing requests from the file at `[[FILE_PATH]]`.

### Input File Format:
The input file can be:
1. **JSON format** - Structured editing requests
2. **Text format** - Line-by-line instructions with image paths
3. **Markdown format** - Instructions with embedded image references

### JSON Example:
```json
{
  "edits": [
    {
      "image": "path/to/image.jpg",
      "prompt": "Remove the background and make it transparent",
      "model": "replicate/image-edit-model"
    },
    {
      "image_url": "https://example.com/image.png",
      "prompt": "Change the sky to sunset colors",
      "style": "photorealistic"
    }
  ]
}
```

### Text Format Example:
```
image: ./edit_image_input_files/cat_sitting_in_chair.jpg
edit: Make the cat wearing a top hat and monocle

image: https://example.com/landscape.jpg
edit: Add northern lights to the sky
```

### Processing Steps:
1. Parse the input file to extract image paths/URLs and editing instructions
2. For local images, verify they exist; for URLs, download them temporarily
3. Use Replicate MCP tool with appropriate image editing models:
   - Background removal: `rembg` or similar
   - Style transfer: `style-transfer` models
   - Object editing: `instructpix2pix` or `stable-diffusion-img2img`
4. Save edited images with descriptive names: `original_name_edited_<timestamp>.png`
5. Create output directory: `edit_images_zone/output/<timestamp>/`
6. Generate a comparison HTML file showing before/after
7. Archive the original instruction file

### Output Structure:
```
edit_images_zone/output/<timestamp>/
├── originals/          # Copies of original images
├── edited/             # Edited versions
├── comparison.html     # Side-by-side comparison
└── manifest.json       # Edit history and metadata
```

### Error Handling:
- Check for REPLICATE_API_TOKEN availability
- Validate image files exist and are accessible
- Handle unsupported image formats gracefully
- Log failed edits but continue with others
- Provide clear error messages for missing dependencies
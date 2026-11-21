# Create Image Command

## Purpose
Generate images from text prompts using Replicate AI models.

## Variables
- `[[FILE_PATH]]` - The absolute path to the file containing image prompts

## Task
Read the file at `[[FILE_PATH]]` and generate images for each prompt found.

### Steps:
1. Read the input file containing image generation prompts
2. Parse each line as a separate prompt (skip empty lines and comments starting with #)
3. For each prompt, use the Replicate MCP tool to generate an image
4. Use a model like `google/nano-banana` or `stability-ai/stable-diffusion` 
5. Save generated images with descriptive filenames based on the prompt
6. Create an output directory structure: `generate_images_zone/output/<timestamp>/`
7. Save metadata about each generation (prompt, model used, timestamp)
8. Move the original prompt file to an archive folder after processing

### Output:
- Generated images saved as PNG/JPG files
- A manifest.json file with generation metadata
- Console output showing progress and results
- Automatically open the output directory when complete

### Error Handling:
- If REPLICATE_API_TOKEN is not set, provide instructions
- Handle rate limiting gracefully with retries
- Skip invalid prompts and continue with valid ones
- Log any generation failures but don't stop the process

### Example Prompt File Format:
```
A serene mountain landscape at sunset
Futuristic city with flying cars
Abstract art in the style of Kandinsky
# This is a comment and will be ignored
Cute robot playing guitar
```
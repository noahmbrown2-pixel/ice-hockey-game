"""
Otter Image Generator using Google Gemini API
Generates cartoon-style otter images using Google's AI image generation capabilities.
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv
    from google import genai
    import vertexai
    from vertexai.preview.vision_models import ImageGenerationModel
except ImportError as e:
    print(f"Error: Missing required package - {e}")
    print("Please run: pip install google-genai google-cloud-aiplatform python-dotenv")
    sys.exit(1)

# Load environment variables from .env file
load_dotenv()


def configure_api():
    """Configure the Google Generative AI API with the API key."""
    api_key = os.getenv('GOOGLE_API_KEY')

    if not api_key:
        print("Error: GOOGLE_API_KEY not found!")
        print("Please create a .env file with your API key:")
        print("GOOGLE_API_KEY=your_api_key_here")
        sys.exit(1)

    # Create client with API key
    client = genai.Client(api_key=api_key)
    print("[OK] API configured successfully")
    return client


def test_connection(client):
    """Test the API connection by listing available models."""
    print("\n[TEST] Testing API connection...")
    try:
        models = client.models.list()
        print("\n[OK] Connection successful! Available models:")
        for model in models:
            print(f"  - {model.name}")
        return True
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return False


def generate_with_imagen(client, prompt, output_filename=None):
    """
    Generate an actual image using the Imagen 3 model via the google-genai client.

    Args:
        client: Google GenAI client
        prompt (str): Image generation prompt
        output_filename (str): Output filename for the image

    Returns:
        str: Path to the generated image file
    """
    from google.genai import types

    print(f"\n[IMAGEN] Using Imagen 3 via Google GenAI API...")

    try:
        # Default output filename
        if not output_filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"otter_imagen_{timestamp}.png"

        print(f"\n[GENERATING] Creating image with Imagen 3...")
        print(f"[PROMPT] {prompt[:100]}..." if len(prompt) > 100 else f"[PROMPT] {prompt}")

        # Generate the image using the newer Imagen 3 model
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            ),
        )

        print("[OK] Image generated successfully!")

        # Save the image
        print(f"\n[SAVING] Saving image to: {output_filename}")
        response.generated_images[0].image.save(output_filename)

        print(f"[SUCCESS] Image saved to: {output_filename}")
        return output_filename

    except Exception as e:
        print(f"\n[ERROR] Failed to generate image: {e}")
        print(f"Error type: {type(e).__name__}")

        if "safety" in str(e).lower():
            print("\nTip: Image rejected by safety filters. Try a different prompt.")
        elif "quota" in str(e).lower():
            print("\nTip: API quota exceeded. Check your Google AI Studio dashboard.")
        elif "not found" in str(e).lower():
            print("\nTip: The model may not be available in your region or with your API key.")

        return None


def generate_otter_image(client, prompt=None, output_filename=None):
    """
    Generate an otter image using the Gemini API.

    Args:
        client: Google GenAI client
        prompt (str): Custom prompt for image generation
        output_filename (str): Custom output filename

    Returns:
        str: Path to the generated image file
    """
    # Default prompt for cartoon otter
    if not prompt:
        prompt = (
            "A cute cartoon otter with a friendly expression and playful pose. "
            "The otter should be illustrated in a Disney/Pixar style with soft colors, "
            "big expressive eyes, and fluffy fur. The otter is floating on its back in water, "
            "holding its paws together. Clean, simple background with light blue water. "
            "Kawaii style, adorable, wholesome, children's book illustration quality."
        )

    print(f"\n[GENERATING] Creating otter image...")
    print(f"[PROMPT] {prompt[:100]}..." if len(prompt) > 100 else f"[PROMPT] {prompt}")

    try:
        # Note: As of January 2025, Gemini API primarily supports text generation
        # For image generation, we'll attempt to use the imagen model if available

        # Try to generate image using the new google-genai package
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=f"Create a detailed description for generating this image: {prompt}"
        )

        print(f"\n[DESCRIPTION] Generated description:")
        print(response.text)

        print("\n[NOTE] IMPORTANT:")
        print("The Gemini API (as of January 2025) primarily generates text, not images.")
        print("For actual image generation, you need to use:")
        print("  1. Vertex AI's Imagen API")
        print("  2. Google AI Studio's image generation interface")
        print("  3. Other image generation APIs (Stable Diffusion, DALL-E, etc.)")
        print("\nThe script has generated a detailed text description instead.")
        print("Would you like me to:")
        print("  A) Update this script to use Vertex AI Imagen")
        print("  B) Integrate with a different image generation service")
        print("  C) Create a prompt file for use with other tools")

        # Save the description to a file
        if not output_filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"otter_description_{timestamp}.txt"

        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(f"Prompt: {prompt}\n\n")
            f.write(f"Generated Description:\n{response.text}\n")

        print(f"\n[OK] Description saved to: {output_filename}")
        return output_filename

    except Exception as e:
        print(f"\n[ERROR] Error generating image: {e}")
        print(f"Error type: {type(e).__name__}")

        # Provide helpful error messages
        if "API key" in str(e):
            print("\nTip: Check that your API key is valid and has the correct permissions")
        elif "quota" in str(e).lower():
            print("\nTip: You may have exceeded your API quota. Check Google AI Studio")
        elif "not found" in str(e).lower():
            print("\nTip: The requested model may not be available with your API key")

        return None


def main():
    """Main function to handle command-line arguments and execute the script."""
    parser = argparse.ArgumentParser(
        description="Generate cartoon otter images using Google AI (Gemini & Vertex AI Imagen)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Text description mode (default)
  python generate_otter_with_gemini.py
  python generate_otter_with_gemini.py --prompt "a cute otter holding a fish"

  # Actual image generation with Vertex AI Imagen
  python generate_otter_with_gemini.py --use-imagen
  python generate_otter_with_gemini.py --use-imagen --prompt "cute otter, cartoon style"
  python generate_otter_with_gemini.py --use-imagen --output my_otter.png
  python generate_otter_with_gemini.py --use-imagen --project-id my-gcp-project

  # Test connection
  python generate_otter_with_gemini.py --test-connection
        """
    )

    parser.add_argument(
        '--prompt',
        type=str,
        help='Custom prompt for otter image generation'
    )

    parser.add_argument(
        '--output',
        type=str,
        help='Output filename for the generated image'
    )

    parser.add_argument(
        '--test-connection',
        action='store_true',
        help='Test the API connection and list available models'
    )

    parser.add_argument(
        '--use-imagen',
        action='store_true',
        help='Use Vertex AI Imagen for actual image generation (requires GCP setup)'
    )

    parser.add_argument(
        '--project-id',
        type=str,
        help='Google Cloud project ID (can also set GOOGLE_CLOUD_PROJECT in .env)'
    )

    parser.add_argument(
        '--location',
        type=str,
        default='us-central1',
        help='GCP location for Imagen (default: us-central1)'
    )

    args = parser.parse_args()

    print("=" * 60)
    print("OTTER IMAGE GENERATOR - Google AI")
    print("=" * 60)

    # Configure API (needed for both modes now)
    client = configure_api()

    # Check if using Imagen mode
    if args.use_imagen:
        print("[MODE] Imagen 3 (Actual Image Generation)")

        # Default prompt if none provided
        if not args.prompt:
            prompt = (
                "A cute cartoon otter with a friendly expression and playful pose. "
                "The otter should be illustrated in a Disney/Pixar style with soft colors, "
                "big expressive eyes, and fluffy fur. The otter is floating on its back in water, "
                "holding its paws together. Clean, simple background with light blue water. "
                "Kawaii style, adorable, wholesome, children's book illustration quality."
            )
        else:
            prompt = args.prompt

        # Generate with Imagen 3
        result = generate_with_imagen(
            client=client,
            prompt=prompt,
            output_filename=args.output
        )

    else:
        print("[MODE] Gemini Text Generation (Description Only)")

        # Test connection if requested
        if args.test_connection:
            test_connection(client)
            return

        # Generate text description
        result = generate_otter_image(
            client,
            prompt=args.prompt,
            output_filename=args.output
        )

    # Final result
    if result:
        print("\n" + "=" * 60)
        print("[SUCCESS] Generation complete!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("[FAILED] Generation failed")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()

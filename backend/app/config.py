import os

from dotenv import load_dotenv


# Load environment variables from a local .env file when one exists.
load_dotenv()


# Gemini API key used later for AI features.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

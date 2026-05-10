import os
import sys
import uvicorn
from pyngrok import ngrok
from dotenv import load_dotenv

# Load existing environment variables from .env if it exists
load_dotenv()

def start_ngrok(port=8000):
    try:
        # Check if there are already active tunnels
        tunnels = ngrok.get_tunnels()
        public_url = None
        
        for tunnel in tunnels:
            if str(port) in tunnel.config['addr']:
                public_url = tunnel.public_url
                break
        
        if not public_url:
            # Open a new HTTP tunnel on the specified port
            public_url = ngrok.connect(port).public_url
            
        print("\n" + "=" * 60)
        print(f"Ngrok Tunnel Started!")
        print(f"Public URL: {public_url}")
        print("=" * 60 + "\n")
        
        # Set the public URL environment variable so the app can use it
        os.environ["PUBLIC_BACKEND_URL"] = public_url
        
        return public_url
    except Exception as e:
        print(f"Failed to start Ngrok: {e}")
        print("Make sure you have ngrok installed and an authtoken configured if required.")
        return None

if __name__ == "__main__":
    # Start Ngrok
    public_url = start_ngrok(8000)
    
    # Start FastAPI with Uvicorn
    # We use 'main:app' so that uvicorn can handle reload if desired
    # We pass the env var here as well just in case, though it's already in os.environ
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

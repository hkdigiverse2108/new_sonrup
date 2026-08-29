import subprocess
import sys
import os
import time
from threading import Thread
from dotenv import load_dotenv 

# Load variables from root-level .env file
load_dotenv()

# Helper to read process output stream and print it with a prefix
def log_stream(stream, prefix):
    try:
        for line in iter(stream.readline, b''):
            decoded_line = line.decode('utf-8', errors='ignore').strip()
            if decoded_line:
                print(f"{prefix} {decoded_line}")
    except Exception:
        pass

def main():
    # Load ports and URLs dynamically from env, fallback to defaults
    backend_port = os.getenv("BACKEND_PORT", "8000")
    frontend_port = os.getenv("FRONTEND_PORT", "5173")
    backend_url = os.getenv("BACKEND_URL", os.getenv("VITE_API_URL", f"http://localhost:{backend_port}"))
    frontend_url = os.getenv("FRONTEND_URL", f"http://localhost:{frontend_port}")

    print(f"[SYSTEM] Starting frontend ({frontend_url}) and backend ({backend_url})...")
    
    # 1. Backend command: run uvicorn as a module from python executable
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload", "--port", backend_port]
    
    # 2. Frontend command: run dev server in the frontend directory passing the port parameter
    frontend_cmd = ["npm", "run", "dev", "--", "--port", frontend_port]

    
    # Start Backend process
    backend_proc = subprocess.Popen(
        backend_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.getcwd()
    )
    
    # Start Frontend process
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.join(os.getcwd(), "frontend"),
        shell=(os.name == 'nt')  # Required on Windows to run npm/cmd scripts
    )
    
    # Spawn threads to capture stdout and stderr from both processes
    threads = [
        Thread(target=log_stream, args=(backend_proc.stdout, "[BACKEND]"), daemon=True),
        Thread(target=log_stream, args=(backend_proc.stderr, "[BACKEND-ERR]"), daemon=True),
        Thread(target=log_stream, args=(frontend_proc.stdout, "[FRONTEND]"), daemon=True),
        Thread(target=log_stream, args=(frontend_proc.stderr, "[FRONTEND-ERR]"), daemon=True)
    ]
    
    for t in threads:
        t.start()
        
    print("[SYSTEM] Both servers started successfully.")
    print(f"[SYSTEM] Backend URL: {backend_url}")
    print(f"[SYSTEM] Frontend URL: {frontend_url}")
    print("[SYSTEM] Press Ctrl+C in this terminal to shut down both servers.")
    
    try:
        while True:
            # Check if either process has exited
            backend_exit = backend_proc.poll()
            frontend_exit = frontend_proc.poll()
            
            if backend_exit is not None:
                print(f"[SYSTEM] Backend exited with code {backend_exit}")
                break
            if frontend_exit is not None:
                print(f"[SYSTEM] Frontend exited with code {frontend_exit}")
                break
                
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n[SYSTEM] Received shutdown signal (Ctrl+C)...")
    finally:
        print("[SYSTEM] Terminating servers...")
        # Clean up child processes (including sub-processes on Windows)
        if os.name == 'nt':
            # On Windows, use taskkill to kill the process tree (/T) forcefully (/F)
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            backend_proc.terminate()
            frontend_proc.terminate()
            
        print("[SYSTEM] Shutdown complete. Goodbye!")

if __name__ == "__main__":
    main()

import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f"Server running on http://localhost:{port}")
    app.run(port=port, debug=os.getenv('FLASK_ENV') == 'development')

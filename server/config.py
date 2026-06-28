import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET    = os.getenv('JWT_SECRET', 'dev_secret_change_me')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_DAYS = 7

MAX_FILE_SIZE_MB   = 5
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg'}

# TrustScore weighting — tunable (Section 3.13.1)
TRUST_RATING_WEIGHT  = 0.7
TRUST_BOOKING_WEIGHT = 0.3

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

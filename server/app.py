import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from db.database import init_db, close_db
from config import UPLOAD_FOLDER
from routes.auth import bp as auth_bp
from routes.profiles import bp as profiles_bp
from routes.search import bp as search_bp
from routes.bookings import bp as bookings_bp
from routes.reviews import bp as reviews_bp
from routes.admin import bp as admin_bp
from routes.messages import bp as messages_bp


def create_app():
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB upload limit

    CORS(app, origins=['http://localhost:5173'], supports_credentials=True)

    # Initialise schema once
    init_db()

    # Tear down DB connection after each request
    app.teardown_appcontext(close_db)

    # Serve uploaded credential files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profiles_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(messages_bp)

    @app.errorhandler(413)
    def too_large(e):
        return {'message': 'File too large'}, 413

    return app

from flask import Flask
from flask_cors import CORS
import logging
import os
from routes import setup_routes

class CommandServer:
    def __init__(self):
        app = Flask(__name__)
        CORS(app, resources={r"/*": {"origins": "*"}})
        self.app = app

        # Configuration du logging
        logging.basicConfig(level=logging.INFO)

        # Définition des routes
        setup_routes(self.app)

    def run(self):
        self.app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    server = CommandServer()
    server.run()

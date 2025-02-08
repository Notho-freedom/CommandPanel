from flask import request, jsonify
from auth import require_auth
from utils import validate_command, load_scripts, get_system_info, execute_command_directly
import logging, psutil
from datetime import datetime, timedelta

command_history = []
connections = []
RESTRICTED_COMMANDS = ["ls", "pwd", "echo"]
SCRIPTS = load_scripts()
THEMES = {
            'dark': {
                'background': 'bg-black',
                'textColor': 'text-white',
                'promptColor': 'text-gray-400',
                'rootColor': 'text-green-500'
            },
            'light': {
                'background': 'bg-gray-200',
                'textColor': 'text-black',
                'promptColor': 'text-gray-800',
                'rootColor': 'text-gray-600'
            },
            'windows': {
                'background': 'bg-blue-800',
                'textColor': 'text-cyan-300',
                'promptColor': 'text-gold',
                'rootColor': 'text-white'
            },
            'ubuntu': {
                'background': 'bg-[#300a24]',
                'textColor': 'text-white',
                'promptColor': 'text-white',
                'rootColor': 'ubt-root'
            },
            'kali': {
                'background': 'bg-gray-900',
                'textColor': 'text-white',
                'promptColor': 'ubt-root',
                'rootColor': 'text-blue-800'
            },
            'macos': {
                'background': 'bg-gray-100',
                'textColor': 'text-black',
                'promptColor': 'text-gray-600',
                'rootColor': 'text-gray-700'
            }
        }
SETTINGS = {
            'fontSize': 'clamp(0.75rem, 2vw, 1rem)',
            'theme': 'dark',
            'image': None,
            'imageOpacity': 1
        }

def setup_routes(app):
    @app.route('/execute', methods=['POST'])
    @require_auth
    def execute_command():
        data = request.json
        command = data.get('command')

        if not command or not validate_command(command):
            logging.error("Commande vide, manquante ou invalide.")
            return jsonify({'error': 'Commande vide, manquante ou invalide.'}), 400

        if command in RESTRICTED_COMMANDS:
            logging.warning(f"Tentative d'exécution d'une commande non autorisée : {command}")
            return jsonify({'error': 'Commande non autorisée.'}), 403

        ip_address = request.remote_addr
        connections.append({'ip': ip_address, 'command': command, 'timestamp': datetime.now()})

        # Exécuter la commande directement et obtenir la sortie
        return execute_command_directly(command, ip_address)

    @app.route('/server-stats', methods=['GET'])
    @require_auth
    def server_stats():
        uptime = datetime.now() - datetime.fromtimestamp(psutil.boot_time())
        stats = {
            'cpu_usage': psutil.cpu_percent(interval=1),
            'memory_usage': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'uptime': str(uptime)
        }
        return jsonify(stats)

    @app.route('/connections', methods=['GET'])
    @require_auth
    def get_connections():
        ip_filter = request.args.get('ip')
        filtered_connections = [conn for conn in connections if conn['ip'] == ip_filter] if ip_filter else connections
        return jsonify(filtered_connections)

    @app.route('/manage-whitelist', methods=['POST'])
    @require_auth
    def manage_whitelist():
        data = request.json
        command = data.get('command')
        action = data.get('action')

        if not command or action not in ["add", "remove"]:
            return jsonify({'error': 'Commande ou action manquante ou invalide.'}), 400

        if action == "add":
            if command not in RESTRICTED_COMMANDS:
                RESTRICTED_COMMANDS.append(command)
                logging.info(f"Commande ajoutée à la liste blanche : {command}")
                return jsonify({'message': f"Commande ajoutée : {command}"}), 200
            return jsonify({'message': 'Commande déjà présente dans la liste blanche.'}), 200

        elif action == "remove":
            if command in RESTRICTED_COMMANDS:
                RESTRICTED_COMMANDS.remove(command)
                logging.info(f"Commande retirée de la liste blanche : {command}")
                return jsonify({'message': f"Commande retirée : {command}"}), 200
            return jsonify({'message': 'Commande non trouvée dans la liste blanche.'}), 404

    @app.route('/run-script', methods=['POST'])
    @require_auth
    def run_script():
        data = request.json
        script_name = data.get('script')

        if not script_name:
            return jsonify({'error': 'Nom du script manquant.'}), 400

        script_content = SCRIPTS.get(script_name)

        if not script_content:
            return jsonify({'error': 'Script non trouvé.'}), 404

        try:
            exec(script_content)
            return jsonify({'message': 'Script exécuté avec succès.'}), 200
        except Exception as e:
            return jsonify({'error': f"Erreur lors de l'exécution du script : {str(e)}"})

    @app.route('/disconnect-inactive', methods=['POST'])
    @require_auth
    def disconnect_inactive():
        inactive_time_limit = timedelta(minutes=5)
        current_time = datetime.now()
        for conn in connections:
            if current_time - conn['timestamp'] > inactive_time_limit:
                connections.remove(conn)
        return jsonify({'message': 'Connexions inactives déconnectées.'}), 200

    @app.route('/history', methods=['GET'])
    @require_auth
    def get_history():
        return jsonify(command_history)

    @app.route('/system-info', methods=['GET'])
    @require_auth
    def system_info():
        return get_system_info()

    @app.route('/get-theme', methods=['POST'])
    def get_theme():
        theme = request.args.get('theme')
        if theme in THEMES:
            return jsonify({'success': True, 'theme': THEMES[theme]})
        else:
            return jsonify({'error': f'Theme not found: {theme}'}), 404

    @app.route('/set-theme', methods=['POST'])
    def set_theme():
        data = request.get_json()
        theme = data.get('theme')
        if theme in THEMES:
            SETTINGS['theme'] = theme
            return jsonify({'message': f'Theme changed to {theme}', 'theme': THEMES[theme]})
        else:
            return jsonify({'error': f'Invalid theme: {theme}'}), 400

    @app.route('/set-font-size', methods=['POST'])
    def set_font_size():
        data = request.get_json()
        font_size = data.get('fontSize')
        SETTINGS['fontSize'] = font_size
        return jsonify({'message': f'Font size changed to {font_size}', 'fontSize': font_size})

    @app.route('/set-background-image', methods=['POST'])
    def set_background_image():
        data = request.get_json()
        image_url = data.get('imageUrl')
        SETTINGS['image'] = image_url
        return jsonify({'message': f'Background image set to {image_url}', 'image': SETTINGS['image']})

    @app.route('/set-image-opacity', methods=['POST'])
    def set_image_opacity():
        data = request.get_json()
        opacity = data.get('opacity')
        if 0 <= opacity <= 1:
            SETTINGS['imageOpacity'] = opacity
            return jsonify({'message': f'Image opacity set to {opacity}', 'imageOpacity': SETTINGS['imageOpacity']})
        else:
            return jsonify({'error': 'Invalid opacity value. Must be between 0 and 1.'}), 400

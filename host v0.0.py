from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import subprocess
import logging
import psutil
from datetime import datetime, timedelta
import json
import socket, requests
import platform
import os
import re
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != 'Bearer your-secret-token':
            abort(401)
        return f(*args, **kwargs)
    return decorated

class CommandServer:
    def __init__(self):
        app = Flask(__name__)
        CORS(app, resources={r"/*": {"origins": "*"}})
        self.app = app
        # Initialisation des données de base
        self.command_history = []
        self.connections = []
        self.RESTRICTED_COMMANDS = ["ls", "pwd", "echo"]
        self.SCRIPTS = self.load_scripts()

        # Configuration du logging
        logging.basicConfig(level=logging.INFO)

        # Définition des routes
        self._setup_routes()

        # Simuler une base de données en mémoire pour les thèmes et paramètres
        self.themes = {
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

        self.settings = {
            'fontSize': 'clamp(0.75rem, 2vw, 1rem)',
            'theme': 'dark',
            'image': None,
            'imageOpacity': 1
        }

    def _setup_routes(self):
        self.app.add_url_rule('/execute', 'execute_command', self.execute_command, methods=['POST'])
        self.app.add_url_rule('/server-stats', 'server_stats', self.server_stats, methods=['GET'])
        self.app.add_url_rule('/connections', 'get_connections', self.get_connections, methods=['GET'])
        self.app.add_url_rule('/manage-whitelist', 'manage_whitelist', self.manage_whitelist, methods=['POST'])
        self.app.add_url_rule('/run-script', 'run_script', self.run_script, methods=['POST'])
        self.app.add_url_rule('/disconnect-inactive', 'disconnect_inactive', self.disconnect_inactive, methods=['POST'])
        self.app.add_url_rule('/history', 'get_history', self.get_history, methods=['GET'])
        self.app.add_url_rule('/system-info', 'get_system_info', self.get_system_info, methods=['GET'])
        self.app.add_url_rule('/get-theme', 'get_theme', self.get_theme, methods=['POST'])
        self.app.add_url_rule('/set-theme', 'set_theme', self.set_theme, methods=['POST'])
        self.app.add_url_rule('/set-font-size', 'set_font_size', self.set_font_size, methods=['POST'])
        self.app.add_url_rule('/set-background-image', 'set_background_image', self.set_background_image, methods=['POST'])
        self.app.add_url_rule('/set-image-opacity', 'set_image_opacity', self.set_image_opacity, methods=['POST'])

    def validate_command(self, command):
        # Validation de la commande pour éviter les injections
        if not re.match(r'^[a-zA-Z0-9_\- ]+$', command):
            return False
        return True


    def get_system_info(self):
        hostname = socket.gethostname()
        ip_addresses = socket.gethostbyname_ex(hostname)[2]

        try:
            public_ip = requests.get('https://api.ipify.org').text
        except requests.RequestException as e:
            logging.error(f"Erreur lors de la récupération de l'adresse IP publique : {e}")
            public_ip = "Erreur lors de la récupération de l'adresse IP publique"

        partitions_info = []

        network_info = {}
        for interface, addrs in psutil.net_if_addrs().items():
            network_info[interface] = [{'address': addr.address, 'family': str(addr.family)} for addr in addrs]

        cpu_info = {
            'count': psutil.cpu_count(),
            'frequency': psutil.cpu_freq()._asdict(),
            'usage': psutil.cpu_percent(interval=1)
        }

        memory_info = {
            'total': psutil.virtual_memory().total,
            'available': psutil.virtual_memory().available,
            'used': psutil.virtual_memory().used,
            'percent': psutil.virtual_memory().percent
        }

        processes_info = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            processes_info.append(proc.info)

        users_info = []
        for user in psutil.users():
            users_info.append({
                'username': user.name,
                'terminal': user.terminal,
                'host': user.host,
                'started': user.started
            })

        system_info = {
            'hostname': hostname,
            'os': platform.system(),
            'os_version': platform.version(),
            'kernel_version': platform.uname().release,
            'architecture': platform.architecture(),
            'partitions': partitions_info,
            'network': network_info,
            'cpu': cpu_info,
            'memory': memory_info,
            'processes': processes_info,
            'users': users_info,
            'web_servers': self.get_web_server_info()  # Informations sur les serveurs web
        }

        return jsonify({
            'ip_addresses': ip_addresses,
            'public_ip': public_ip,
            'system_info': system_info
        })

    def get_web_server_info(self):
        web_servers = ['nginx', 'apache2']  # Liste des serveurs web à surveiller
        web_server_info = []

        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            if proc.info['name'] in web_servers:
                web_server_info.append(proc.info)

        return web_server_info


    def get_theme(self):
        theme = request.args.get('theme')  # Récupérer le thème depuis les paramètres de la requête

        if theme in self.themes:
            return jsonify({'success': True, 'theme': self.themes[theme]})  # Retourne le thème demandé
        else:
            return jsonify({'error': f'Theme not found: {theme}'}), 404

    def set_theme(self):
        data = request.get_json()
        theme = data.get('theme')

        if theme in self.themes:
            self.settings['theme'] = theme
            return jsonify({'message': f'Theme changed to {theme}', 'theme': self.themes[theme]})
        else:
            return jsonify({'error': f'Invalid theme: {theme}'}), 400

    def set_font_size(self):
        data = request.get_json()
        font_size = data.get('fontSize')

        self.settings['fontSize'] = font_size
        return jsonify({'message': f'Font size changed to {font_size}', 'fontSize': font_size})

    def set_background_image(self):
        data = request.get_json()
        image_url = data.get('imageUrl')

        self.settings['image'] = image_url
        return jsonify({'message': f'Background image set to {image_url}', 'image': self.settings['image']})

    def set_image_opacity(self):
        data = request.get_json()
        opacity = data.get('opacity')

        if 0 <= opacity <= 1:
            self.settings['imageOpacity'] = opacity
            return jsonify({'message': f'Image opacity set to {opacity}', 'imageOpacity': self.settings['imageOpacity']})
        else:
            return jsonify({'error': 'Invalid opacity value. Must be between 0 and 1.'}), 400

    def load_scripts(self):
        try:
            with open('utils.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Erreur lors du chargement des scripts : {e}")
            return {}
        
    @require_auth
    def execute_command(self):
        data = request.json
        command = data.get('command')

        if not command or not self.validate_command(command):
            logging.error("Commande vide, manquante ou invalide.")
            return jsonify({'error': 'Commande vide, manquante ou invalide.'}), 400

        if command in self.RESTRICTED_COMMANDS:
            logging.warning(f"Tentative d'exécution d'une commande non autorisée : {command}")
            return jsonify({'error': 'Commande non autorisée.'}), 403

        ip_address = request.remote_addr
        self.connections.append({'ip': ip_address, 'command': command, 'timestamp': datetime.now()})

        # Exécuter la commande directement et obtenir la sortie
        return self.execute_command_directly(command, ip_address)

    def execute_command_directly(self, command, ip_address):
        encodings_to_try = ['utf-8', 'cp1252', 'latin-1', 'utf-16', 'utf-32', 'ascii', 'mac_roman', 'iso-8859-15', 'windows-1250', 'windows-1251', 'windows-1253', 'windows-1254', 'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258'] # Liste des encodages à essayer
        for encoding in encodings_to_try:
            try:
                output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, encoding=encoding)
                self.command_history.append({'command': command, 'output': output, 'ip': ip_address})
                logging.info(f"Commande exécutée : {command} par {ip_address}")

                # Retourner la sortie sous forme de JSON
                return jsonify({'success': True, 'command': command, 'output': output}), 200

            except subprocess.CalledProcessError as e:
                logging.error(f"Erreur lors de l'exécution de la commande '{command}': {e.output}")
                self.command_history.append({'command': command, 'error': e.output, 'ip': ip_address})

                # Retourner l'erreur sous forme de JSON
                return jsonify({'success': False, 'command': command, 'error': e.output})

            except UnicodeDecodeError:
                logging.warning(f"Erreur de décodage avec l'encodage '{encoding}'. Essai avec un autre encodage.")

        # Si tous les essais échouent, retourner la sortie brute
        try:
            output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT)
            logging.error(f"Tous les essais d'encodage ont échoué.\n Sortie brute :\n\n {output}")
            return jsonify({'success': False, 'command': command, 'error': 'Erreur de décodage. Sortie brute.', 'raw_output': output.decode('latin-1',errors='replace')}), 200
        except Exception as e:
            logging.error(f"Erreur lors de la récupération de la sortie brute : {e}")
            return jsonify({'success': False, 'command': command, 'error': 'Erreur lors de la récupération de la sortie brute.'})

    @require_auth
    def server_stats(self):
        # Récupère les statistiques
        uptime = datetime.now() - datetime.fromtimestamp(psutil.boot_time())

        # Convertir l'uptime en chaîne de caractères
        stats = {
            'cpu_usage': psutil.cpu_percent(interval=1),
            'memory_usage': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'uptime': str(uptime)  # Conversion en chaîne de caractères
        }
        return jsonify(stats)

    @require_auth
    def get_connections(self):
        ip_filter = request.args.get('ip')
        filtered_connections = [conn for conn in self.connections if conn['ip'] == ip_filter] if ip_filter else self.connections
        return jsonify(filtered_connections)

    @require_auth
    def manage_whitelist(self):
        data = request.json
        command = data.get('command')
        action = data.get('action')

        if not command or action not in ["add", "remove"]:
            return jsonify({'error': 'Commande ou action manquante ou invalide.'}), 400

        if action == "add":
            if command not in self.RESTRICTED_COMMANDS:
                self.RESTRICTED_COMMANDS.append(command)
                logging.info(f"Commande ajoutée à la liste blanche : {command}")
                return jsonify({'message': f"Commande ajoutée : {command}"}), 200
            return jsonify({'message': 'Commande déjà présente dans la liste blanche.'}), 200

        elif action == "remove":
            if command in self.RESTRICTED_COMMANDS:
                self.RESTRICTED_COMMANDS.remove(command)
                logging.info(f"Commande retirée de la liste blanche : {command}")
                return jsonify({'message': f"Commande retirée : {command}"}), 200
            return jsonify({'message': 'Commande non trouvée dans la liste blanche.'}), 404

    @require_auth
    def run_script(self):
        data = request.json
        script_name = data.get('script')

        if not script_name:
            return jsonify({'error': 'Nom du script manquant.'}), 400

        script_content = self.SCRIPTS.get(script_name)

        if not script_content:
            return jsonify({'error': 'Script non trouvé.'}), 404

        try:
            exec(script_content)
            return jsonify({'message': 'Script exécuté avec succès.'}), 200
        except Exception as e:
            return jsonify({'error': f"Erreur lors de l'exécution du script : {str(e)}"})

    @require_auth
    def disconnect_inactive(self):
        inactive_time_limit = timedelta(minutes=5)  # Définir une limite de temps pour l'inactivité
        current_time = datetime.now()
        for conn in self.connections:
            if current_time - conn['timestamp'] > inactive_time_limit:
                self.connections.remove(conn)
        return jsonify({'message': 'Connexions inactives déconnectées.'}), 200

    @require_auth
    def get_history(self):
        return jsonify(self.command_history)

    def run(self):
        self.app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    server = CommandServer()
    server.run()

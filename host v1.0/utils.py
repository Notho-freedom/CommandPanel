import re
import json
import logging
import socket
import request2
import subprocess
import psutil
import platform
from flask import jsonify

COMMAND_HISTORY = []

def validate_command(command):
    # Validation de la commande pour éviter les injections
    if not re.match(r'^[a-zA-Z0-9_\- ]+$', command):
        return False
    return True

def load_scripts():
    try:
        with open('utils.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Erreur lors du chargement des scripts : {e}")
        return {}
def get_system_info():
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
        'web_servers': get_web_server_info()  # Informations sur les serveurs web
    }

    return jsonify({
        'ip_addresses': ip_addresses,
        'public_ip': public_ip,
        'system_info': system_info
    })

def get_web_server_info():
    web_servers = ['nginx', 'apache2']  # Liste des serveurs web à surveiller
    web_server_info = []

    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        if proc.info['name'] in web_servers:
            web_server_info.append(proc.info)

    return web_server_info

def execute_command_directly(command, ip_address):
    encodings_to_try = ['utf-8', 'cp1252', 'latin-1', 'utf-16', 'utf-32', 'ascii', 'mac_roman', 'iso-8859-15', 'windows-1250', 'windows-1251', 'windows-1253', 'windows-1254', 'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258']  # Liste des encodages à essayer
    for encoding in encodings_to_try:
        try:
            output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, encoding=encoding)
            COMMAND_HISTORY.append({'command': command, 'output': output, 'ip': ip_address})
            logging.info(f"Commande exécutée : {command} par {ip_address}")

            # Retourner la sortie sous forme de JSON
            return jsonify({'success': True, 'command': command, 'output': output}), 200

        except subprocess.CalledProcessError as e:
            logging.error(f"Erreur lors de l'exécution de la commande '{command}': {e.output}")
            COMMAND_HISTORY.append({'command': command, 'error': e.output, 'ip': ip_address})

            # Retourner l'erreur sous forme de JSON
            return jsonify({'success': False, 'command': command, 'error': e.output})

        except UnicodeDecodeError:
            logging.warning(f"Erreur de décodage avec l'encodage '{encoding}'. Essai avec un autre encodage.")

    # Si tous les essais échouent, retourner la sortie brute
    try:
        output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT)
        logging.error(f"Tous les essais d'encodage ont échoué.\n Sortie brute :\n\n {output}")
        return jsonify({'success': False, 'command': command, 'error': 'Erreur de décodage. Sortie brute.', 'raw_output': output.decode('latin-1', errors='replace')}), 200
    except Exception as e:
        logging.error(f"Erreur lors de la récupération de la sortie brute : {e}")
        return jsonify({'success': False, 'command': command, 'error': 'Erreur lors de la récupération de la sortie brute.'})

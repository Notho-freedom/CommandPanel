from functools import wraps
from flask import request, abort

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != 'your-secret-token':
            abort(401)
        return f(*args, **kwargs)
    return decorated

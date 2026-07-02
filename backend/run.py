import os
from app import create_app
from config import DevelopmentConfig, ProductionConfig

config = ProductionConfig if os.environ.get('FLASK_ENV') == 'production' else DevelopmentConfig
app = create_app(config_class=config)

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG') == 'true', host='0.0.0.0', port=5000)

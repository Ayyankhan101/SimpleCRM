from flask_smorest import Blueprint

contacts_blp = Blueprint('contacts', 'Contacts', url_prefix='/api/v1/contacts', description='Contact management')
deals_blp = Blueprint('deals', 'Deals', url_prefix='/api/v1/deals', description='Deal pipeline')
activities_blp = Blueprint('activities', 'Activities', url_prefix='/api/v1/activities', description='Activity tracking')
stats_blp = Blueprint('stats', 'Stats', url_prefix='/api/v1/stats', description='Dashboard stats')

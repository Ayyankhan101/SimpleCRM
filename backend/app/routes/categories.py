from app import cache
from app.models import Category, db
from app.services.security import sanitize_dict
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

bp = Blueprint('categories', __name__, url_prefix='/api/categories')


@bp.route('', methods=['GET'])
@login_required
@cache.memoize(timeout=60)
def get_categories():
    categories = Category.query.filter_by(user_id=current_user.id).order_by(Category.name).all()
    return jsonify([cat.to_dict() for cat in categories])


@bp.route('/<int:id>', methods=['GET'])
@login_required
def get_category(id):
    category = Category.query.filter_by(id=id, user_id=current_user.id).first()

    if not category:
        return jsonify({'error': 'Category not found'}), 404

    return jsonify(category.to_dict())


@bp.route('', methods=['POST'])
@login_required
def create_category():
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    data = sanitize_dict(data)

    existing = Category.query.filter_by(name=data['name'], user_id=current_user.id).first()
    if existing:
        return jsonify({'error': 'Category already exists'}), 400

    category = Category(
        name=data['name'],
        description=data.get('description'),
        color=data.get('color', '#3B82F6'),
        icon=data.get('icon', 'folder'),
        user_id=current_user.id
    )

    db.session.add(category)
    db.session.commit()

    return jsonify(category.to_dict()), 201


@bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_category(id):
    category = Category.query.filter_by(id=id, user_id=current_user.id).first()

    if not category:
        return jsonify({'error': 'Category not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    data = sanitize_dict(data)

    if data.get('name'):
        existing = Category.query.filter(
            Category.name == data['name'],
            Category.user_id == current_user.id,
            Category.id != id
        ).first()
        if existing:
            return jsonify({'error': 'Category name already exists'}), 400
        category.name = data['name']

    if 'description' in data:
        category.description = data['description']
    if 'color' in data:
        category.color = data['color']
    if 'icon' in data:
        category.icon = data['icon']

    db.session.commit()

    return jsonify(category.to_dict())


@bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_category(id):
    category = Category.query.filter_by(id=id, user_id=current_user.id).first()

    if not category:
        return jsonify({'error': 'Category not found'}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({'message': 'Category deleted successfully'})

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grants.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Database Models
class Grant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    amount = db.Column(db.Float)
    deadline = db.Column(db.Date)
    status = db.Column(db.String(50), default='active')
    organization = db.Column(db.String(200))
    contact_email = db.Column(db.String(100))
    website = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with tags
    tags = db.relationship('Tag', secondary='grant_tags', backref='grants')

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    color = db.Column(db.String(7), default='#007bff')
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Association table for many-to-many relationship
grant_tags = db.Table('grant_tags',
    db.Column('grant_id', db.Integer, db.ForeignKey('grant.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Grant Tag System API is running'})

# Grant routes
@app.route('/api/grants', methods=['GET'])
def get_grants():
    search = request.args.get('search', '')
    tag_id = request.args.get('tag')
    status = request.args.get('status')
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    query = Grant.query
    
    if search:
        query = query.filter(
            db.or_(
                Grant.title.contains(search),
                Grant.description.contains(search),
                Grant.organization.contains(search)
            )
        )
    
    if tag_id:
        query = query.join(grant_tags).filter(grant_tags.c.tag_id == tag_id)
    
    if status:
        query = query.filter(Grant.status == status)
    
    grants = query.offset(offset).limit(limit).all()
    
    result = []
    for grant in grants:
        grant_data = {
            'id': grant.id,
            'title': grant.title,
            'description': grant.description,
            'amount': grant.amount,
            'deadline': grant.deadline.isoformat() if grant.deadline else None,
            'status': grant.status,
            'organization': grant.organization,
            'contact_email': grant.contact_email,
            'website': grant.website,
            'created_at': grant.created_at.isoformat(),
            'updated_at': grant.updated_at.isoformat(),
            'tags': [{'id': tag.id, 'name': tag.name, 'color': tag.color} for tag in grant.tags]
        }
        result.append(grant_data)
    
    return jsonify(result)

@app.route('/api/grants/<int:grant_id>', methods=['GET'])
def get_grant(grant_id):
    grant = Grant.query.get_or_404(grant_id)
    
    grant_data = {
        'id': grant.id,
        'title': grant.title,
        'description': grant.description,
        'amount': grant.amount,
        'deadline': grant.deadline.isoformat() if grant.deadline else None,
        'status': grant.status,
        'organization': grant.organization,
        'contact_email': grant.contact_email,
        'website': grant.website,
        'created_at': grant.created_at.isoformat(),
        'updated_at': grant.updated_at.isoformat(),
        'tags': [{'id': tag.id, 'name': tag.name, 'color': tag.color} for tag in grant.tags]
    }
    
    return jsonify(grant_data)

@app.route('/api/grants', methods=['POST'])
def create_grant():
    data = request.get_json()
    
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    grant = Grant(
        title=data['title'],
        description=data.get('description'),
        amount=data.get('amount'),
        deadline=datetime.strptime(data['deadline'], '%Y-%m-%d').date() if data.get('deadline') else None,
        status=data.get('status', 'active'),
        organization=data.get('organization'),
        contact_email=data.get('contact_email'),
        website=data.get('website')
    )
    
    db.session.add(grant)
    db.session.flush()  # Get the ID
    
    # Add tags if provided
    if data.get('tags'):
        for tag_id in data['tags']:
            tag = Tag.query.get(tag_id)
            if tag:
                grant.tags.append(tag)
    
    db.session.commit()
    
    return jsonify({'id': grant.id, 'message': 'Grant created successfully'}), 201

@app.route('/api/grants/<int:grant_id>', methods=['PUT'])
def update_grant(grant_id):
    grant = Grant.query.get_or_404(grant_id)
    data = request.get_json()
    
    if 'title' in data:
        grant.title = data['title']
    if 'description' in data:
        grant.description = data['description']
    if 'amount' in data:
        grant.amount = data['amount']
    if 'deadline' in data:
        grant.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date() if data['deadline'] else None
    if 'status' in data:
        grant.status = data['status']
    if 'organization' in data:
        grant.organization = data['organization']
    if 'contact_email' in data:
        grant.contact_email = data['contact_email']
    if 'website' in data:
        grant.website = data['website']
    
    grant.updated_at = datetime.utcnow()
    
    # Update tags if provided
    if 'tags' in data:
        grant.tags.clear()
        for tag_id in data['tags']:
            tag = Tag.query.get(tag_id)
            if tag:
                grant.tags.append(tag)
    
    db.session.commit()
    
    return jsonify({'message': 'Grant updated successfully'})

@app.route('/api/grants/<int:grant_id>', methods=['DELETE'])
def delete_grant(grant_id):
    grant = Grant.query.get_or_404(grant_id)
    db.session.delete(grant)
    db.session.commit()
    
    return jsonify({'message': 'Grant deleted successfully'})

# Tag routes
@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    result = []
    for tag in tags:
        tag_data = {
            'id': tag.id,
            'name': tag.name,
            'color': tag.color,
            'description': tag.description,
            'created_at': tag.created_at.isoformat()
        }
        result.append(tag_data)
    
    return jsonify(result)

@app.route('/api/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id)
    
    tag_data = {
        'id': tag.id,
        'name': tag.name,
        'color': tag.color,
        'description': tag.description,
        'created_at': tag.created_at.isoformat()
    }
    
    return jsonify(tag_data)

@app.route('/api/tags', methods=['POST'])
def create_tag():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    tag = Tag(
        name=data['name'],
        color=data.get('color', '#007bff'),
        description=data.get('description')
    )
    
    try:
        db.session.add(tag)
        db.session.commit()
        return jsonify({'id': tag.id, 'message': 'Tag created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Tag with this name already exists'}), 409

@app.route('/api/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id)
    data = request.get_json()
    
    if 'name' in data:
        tag.name = data['name']
    if 'color' in data:
        tag.color = data['color']
    if 'description' in data:
        tag.description = data['description']
    
    try:
        db.session.commit()
        return jsonify({'message': 'Tag updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Tag with this name already exists'}), 409

@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id)
    db.session.delete(tag)
    db.session.commit()
    
    return jsonify({'message': 'Tag deleted successfully'})

@app.route('/api/tags/<int:tag_id>/grants', methods=['GET'])
def get_grants_by_tag(tag_id):
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    grants = Grant.query.join(grant_tags).filter(grant_tags.c.tag_id == tag_id).offset(offset).limit(limit).all()
    
    result = []
    for grant in grants:
        grant_data = {
            'id': grant.id,
            'title': grant.title,
            'description': grant.description,
            'amount': grant.amount,
            'deadline': grant.deadline.isoformat() if grant.deadline else None,
            'status': grant.status,
            'organization': grant.organization,
            'contact_email': grant.contact_email,
            'website': grant.website,
            'created_at': grant.created_at.isoformat(),
            'updated_at': grant.updated_at.isoformat(),
            'tags': [{'id': tag.id, 'name': tag.name, 'color': tag.color} for tag in grant.tags]
        }
        result.append(grant_data)
    
    return jsonify(result)

# Initialize database and create sample data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create sample tags if they don't exist
        if Tag.query.count() == 0:
            sample_tags = [
                Tag(name='Education', color='#28a745', description='Grants related to educational initiatives'),
                Tag(name='Healthcare', color='#dc3545', description='Grants for healthcare and medical research'),
                Tag(name='Technology', color='#007bff', description='Technology and innovation grants'),
                Tag(name='Environment', color='#20c997', description='Environmental and sustainability grants'),
                Tag(name='Arts', color='#6f42c1', description='Arts and culture grants')
            ]
            
            for tag in sample_tags:
                db.session.add(tag)
            
            db.session.commit()
            
            # Create sample grants
            sample_grants = [
                Grant(
                    title='STEM Education Initiative',
                    description='Supporting science, technology, engineering, and mathematics education in underserved communities',
                    amount=50000,
                    deadline=datetime(2024, 6, 30).date(),
                    organization='Education Foundation',
                    contact_email='grants@edfoundation.org',
                    website='https://edfoundation.org'
                ),
                Grant(
                    title='Mental Health Research Grant',
                    description='Funding for innovative mental health research and treatment programs',
                    amount=75000,
                    deadline=datetime(2024, 8, 15).date(),
                    organization='Health Research Institute',
                    contact_email='research@healthinstitute.org',
                    website='https://healthinstitute.org'
                ),
                Grant(
                    title='Green Technology Innovation',
                    description='Supporting development of sustainable and environmentally friendly technologies',
                    amount=100000,
                    deadline=datetime(2024, 7, 20).date(),
                    organization='Green Future Foundation',
                    contact_email='innovation@greenfuture.org',
                    website='https://greenfuture.org'
                )
            ]
            
            for grant in sample_grants:
                db.session.add(grant)
            
            db.session.commit()
            
            # Add tags to grants
            grants = Grant.query.all()
            tags = Tag.query.all()
            
            if grants and tags:
                grants[0].tags.extend([tags[0], tags[2]])  # Education + Technology
                grants[1].tags.append(tags[1])  # Healthcare
                grants[2].tags.extend([tags[2], tags[3]])  # Technology + Environment
                
                db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)

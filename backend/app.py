import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta


load_dotenv()

app = Flask(__name__)
# Database connection
CORS(app, resources={r"/api/*": {"origins": "*"}})
# Local Development Database (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_dev.db'

# AWS RDS Production Database (Uncomment and add real password if testing AWS locally)
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:YOUR_PASSWORD_HERE@kush-db.czq6a4a0sbnx.us-east-2.rds.amazonaws.com:5432/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    feedback_text = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='INCOMPLETE')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "feedback_text": self.feedback_text,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Backend is running!"}), 200

@app.route('/api/partial', methods=['POST'])
def save_partial():
    data = request.json
    new_sub = Submission(first_name=data.get('first_name'), last_name=data.get('last_name'))
    db.session.add(new_sub)
    db.session.commit()
    # Return the ID so the frontend can use it if they complete the form
    return jsonify({"id": new_sub.id, "status": "INCOMPLETE"}), 201

@app.route('/api/complete', methods=['POST'])
def save_complete():
    data = request.json
    sub = db.session.get(Submission, data.get('id'))
    if not sub:
        return jsonify({"error": "Not found"}), 404
    sub.feedback_text = data.get('feedback_text')
    sub.status = 'COMPLETE'
    db.session.commit()
    return jsonify({"id": sub.id, "status": "COMPLETE"}), 200

@app.route('/api/admin/responses', methods=['GET'])
def get_responses():
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', 'ALL')
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    query = Submission.query
    if status_filter != 'ALL':
        query = query.filter_by(status=status_filter)
    if date_from:
        query = query.filter(Submission.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Submission.created_at <= datetime.fromisoformat(date_to) + timedelta(days=1))
    query = query.order_by(Submission.id.desc())
    paginated = query.paginate(page=page, per_page=10, error_out=False)
    return jsonify({
        "data": [s.to_dict() for s in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    })

@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    rows = Submission.query.all()
    daily = {}
    for row in rows:
        if not row.created_at:
            continue
        d = row.created_at.strftime('%Y-%m-%d')
        if d not in daily:
            daily[d] = {"date": d, "complete": 0, "incomplete": 0}
        daily[d]["complete" if row.status == "COMPLETE" else "incomplete"] += 1
    
    # Sort the list by date before returning
    sorted_daily = sorted(list(daily.values()), key=lambda x: x['date'])
    return jsonify(sorted_daily)

@app.route('/api/admin/responses/<int:sub_id>', methods=['DELETE'])
def delete_response(sub_id):
    sub = db.session.get(Submission, sub_id)
    if not sub: return jsonify({"error": "Not found"}), 404
    db.session.delete(sub)
    db.session.commit()
    return '', 204


# Create tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5001)

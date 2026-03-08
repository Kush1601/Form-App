import random, itertools
from datetime import datetime, timedelta
from app import app, db, Submission

# Generate 1000 random names for testing
firsts = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Sam', 'Jess', 'Drew', 'Avery', 'Harper', 'Quinn', 'Blake', 'Dakota', 'Parker', 'Skyler', 'Cameron', 'Payton', 'Reese', 'Rory', 'Logan', 'Ryan', 'Rowan', 'Charlie', 'Elliott', 'Finley', 'River', 'Emerson', 'Phoenix', 'Kendall', 'Marley', 'Tatum', 'Sage', 'Dallas', 'Micah']
lasts = ['Smith', 'Doe', 'Miller', 'Davis', 'Chen', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez']

unique_names = list(itertools.product(firsts, lasts))
random.shuffle(unique_names)
unique_names = unique_names[:1000]
now = datetime.utcnow()

with app.app_context():
    print("Clearing old data...")
    db.session.query(Submission).delete()

    print("Generating 1000 records across 14 days...")
    subs = []
    for first, last in unique_names:
        status = 'COMPLETE' if random.random() > 0.3 else 'INCOMPLETE'
        fb = random.choice(["Love the design!", "Great UX", "Smooth experience", "Very clean"]) if status == 'COMPLETE' else None
        ts = now - timedelta(days=random.randint(0, 13), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        subs.append(Submission(first_name=first, last_name=last, feedback_text=fb, status=status, created_at=ts))

    db.session.bulk_save_objects(subs)
    db.session.commit()
    print("Done!")

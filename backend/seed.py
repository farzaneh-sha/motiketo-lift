from database import Base, SessionLocal, engine
from models import MotivationalMessage, Protein, Question, User

PROTEIN_NAMES = ["Chicken", "Beef", "Fish", "Turkey", "Egg", "Cheese"]

QUESTIONS = [
    {
        "code": "Days_FeltFat",
        "text": "During the past 28 days, how many days have you felt unhappy with your body or weight?",
        "response_scale": "scale_b",
        "display_order": 1,
    },
    {
        "code": "EatLess_ToPreventWeightGain",
        "text": "During the past 28 days, how often have you reduced the amount of food you ate to manage your weight?",
        "response_scale": "scale_a",
        "display_order": 2,
    },
    {
        "code": "Days_FearLosingControlOverEating",
        "text": "During the past 28 days, how many days have you wished to improve your body shape?",
        "response_scale": "scale_b",
        "display_order": 4,
    },
    {
        "code": "Eat_WhenAnxious",
        "text": "During the past 28 days, how often have you eaten when you felt stressed or anxious?",
        "response_scale": "scale_a",
        "display_order": 3,
    },
    {
        "code": "Days_ExcludedFoodControlShapeOrWeight",
        "text": "During the past 28 days, how many days have you been concerned about gaining weight?",
        "response_scale": "scale_b",
        "display_order": 6,
    },
    {
        "code": "EatLess_AfterOvereating",
        "text": "During the past 28 days, how often have you followed a specific eating plan to manage your weight?",
        "response_scale": "scale_a",
        "display_order": 5,
    },
    {
        "code": "Days_TriedLimitFoodControlShapeOrWeight",
        "text": "During the past 28 days, how many days have you felt uncomfortable because of your body shape or weight?",
        "response_scale": "scale_b",
        "display_order": 8,
    },
    {
        "code": "Eat_WhenThingsGoWrong",
        "text": "During the past 28 days, how often have you eaten to feel better when you were having a difficult day?",
        "response_scale": "scale_a",
        "display_order": 7,
    },
    {
        "code": "Days_FollowedRulesControlShapeOrWeight",
        "text": "During the past 28 days, how many days have you been unhappy with your current weight?",
        "response_scale": "scale_b",
        "display_order": 10,
    },
    {
        "code": "AvoidEveningEating_ToWatchWeight",
        "text": "During the past 28 days, how often have you avoided eating in the evening to support your health or weight goals?",
        "response_scale": "scale_a",
        "display_order": 9,
    },
]


MOTIVATIONAL_MESSAGES = [
    {"behavior_cluster": "higher_concern", "message": "Focus on consistency rather than perfection."},
    {"behavior_cluster": "higher_concern", "message": "One difficult meal does not erase your progress."},
    {"behavior_cluster": "higher_concern", "message": "Try to notice your eating choices without judging yourself."},
    {"behavior_cluster": "higher_concern", "message": "Small, steady choices can be more helpful than strict rules."},
    {"behavior_cluster": "higher_concern", "message": "Your progress is not defined by one day or one meal."},
    {"behavior_cluster": "lower_concern", "message": "Keep building on the balanced habits that already work for you."},
    {"behavior_cluster": "lower_concern", "message": "Small consistent choices can support long-term progress."},
    {"behavior_cluster": "lower_concern", "message": "Stay mindful of your meals and continue at a comfortable pace."},
    {"behavior_cluster": "lower_concern", "message": "A flexible routine can help you stay consistent."},
    {"behavior_cluster": "lower_concern", "message": "Keep focusing on habits that feel realistic and sustainable."},
]


def create_tables():
    Base.metadata.create_all(bind=engine)
    print(f"Tables created (or already existed): {list(Base.metadata.tables.keys())}")


def seed_proteins(db):
    for name in PROTEIN_NAMES:
        exists = db.query(Protein).filter(Protein.name == name).first()
        if not exists:
            db.add(Protein(name=name))
    db.commit()
    count = db.query(Protein).count()
    print(f"Proteins in database: {count}")


def seed_questions(db):
    for q in QUESTIONS:
        exists = db.query(Question).filter(Question.code == q["code"]).first()
        if not exists:
            db.add(Question(**q))
    db.commit()
    count = db.query(Question).count()
    print(f"Questions in database: {count}")


def seed_motivational_messages(db):
    for m in MOTIVATIONAL_MESSAGES:
        exists = (
            db.query(MotivationalMessage)
            .filter(
                MotivationalMessage.behavior_cluster == m["behavior_cluster"],
                MotivationalMessage.message == m["message"],
            )
            .first()
        )
        if not exists:
            db.add(MotivationalMessage(**m))
    db.commit()

    higher_count = db.query(MotivationalMessage).filter(MotivationalMessage.behavior_cluster == "higher_concern").count()
    lower_count = db.query(MotivationalMessage).filter(MotivationalMessage.behavior_cluster == "lower_concern").count()
    print(f"Motivational messages in database: {higher_count} higher_concern, {lower_count} lower_concern")


def create_test_user_with_protein_preferences(db):
    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        user = User(
            name="Test User",
            email="test@example.com",
            password_hash="test",
            message_frequency="weekly",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created test user: id={user.id}, email={user.email}")
    else:
        print(f"Test user already existed: id={user.id}, email={user.email}")

    chicken = db.query(Protein).filter(Protein.name == "Chicken").first()
    fish = db.query(Protein).filter(Protein.name == "Fish").first()

    for protein in (chicken, fish):
        if protein not in user.proteins:
            user.proteins.append(protein)
    db.commit()
    db.refresh(user)

    print(f"user.proteins for '{user.email}': {[p.name for p in user.proteins]}")


if __name__ == "__main__":
    create_tables()

    db = SessionLocal()
    try:
        seed_proteins(db)
        seed_questions(db)
        seed_motivational_messages(db)
        create_test_user_with_protein_preferences(db)
    finally:
        db.close()

    print("\nSeeding done.")

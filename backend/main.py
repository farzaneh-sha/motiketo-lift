import random
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Literal
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "ml" / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from behavioral_model import (  
    BehavioralClusterModel,
    InputValidationError,
    predict_behavioral_cluster,
)

from database import Base, engine, get_db  
from models import (  
    BehaviorProfile, Food, MealPlan, MealPlanItem, MotivationalMessage,
    Protein, Question, QuestionnaireAnswer, User, UserMessage, Vegetable, WeeklyCheckin,
)


Base.metadata.create_all(bind=engine)

model = BehavioralClusterModel.load()


app = FastAPI(
    title="MotiKeto Lift - Behavioral Profiling API",
    root_path="/api",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



class BehaviorAnswers(BaseModel):
    model_config = ConfigDict(extra="forbid")

    Days_FearLosingControlOverEating: str
    Days_ExcludedFoodControlShapeOrWeight: str
    Days_TriedLimitFoodControlShapeOrWeight: str
    Days_FollowedRulesControlShapeOrWeight: str
    Days_FeltFat: str
    EatLess_ToPreventWeightGain: str
    EatLess_AfterOvereating: str
    AvoidEveningEating_ToWatchWeight: str
    Eat_WhenAnxious: str
    Eat_WhenThingsGoWrong: str



EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _validate_email_format(value: str) -> str:
    value = value.strip()
    if not EMAIL_REGEX.match(value):
        raise ValueError("Invalid email format")
    return value.lower()


def _validate_non_empty(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("This field is required")
    return value


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6)

    _validate_name = field_validator("name")(_validate_non_empty)
    _validate_email = field_validator("email")(_validate_email_format)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)

    _validate_email = field_validator("email")(_validate_email_format)


class UpdateUserRequest(BaseModel):
    name: str
    email: str

    _validate_name = field_validator("name")(_validate_non_empty)
    _validate_email = field_validator("email")(_validate_email_format)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: str
    new_password: str = Field(min_length=6)

    _validate_email = field_validator("email")(_validate_email_format)


class DeleteUserByEmailRequest(BaseModel):
    email: str

    _validate_email = field_validator("email")(_validate_email_format)



class ProteinIdsRequest(BaseModel):
    protein_ids: list[int]


class VegetableIdsRequest(BaseModel):
    vegetable_ids: list[int]


class MealPlanRequest(BaseModel):
    start_date: date | None = None


class MessageFrequencyRequest(BaseModel):
    message_frequency: Literal[
        "every_minute", "daily", "every_2_days",
        "weekly", "biweekly", "monthly", "quarterly", "off",
    ]


class WeeklyCheckinRequest(BaseModel):
    meal_plan_id: int
    week_number: Literal[1, 2, 3, 4]
    adherence_level: Literal["not_at_all", "a_little", "about_half", "mostly", "completely"]



WEEKLY_CHECKIN_SCORES = {
    "not_at_all": 0,
    "a_little": 6.25,
    "about_half": 12.5,
    "mostly": 18.75,
    "completely": 25,
}


MESSAGE_FREQUENCY_INTERVALS = {
    "every_minute": timedelta(minutes=1),
    "daily": timedelta(days=1),
    "every_2_days": timedelta(days=2),
    "weekly": timedelta(days=7),
    "biweekly": timedelta(days=14),
    "monthly": timedelta(days=30),
    "quarterly": timedelta(days=90),
}



MEAL_PLAN_WEEKS = 4
MEAL_PLAN_DAYS_PER_WEEK = 7


RECENT_REPEAT_PENALTY = 10
BREAKFAST_RECENT_WINDOW = 4  
LUNCH_RECENT_WINDOW = 3 
DINNER_RECENT_WINDOW = 3  
VEGETABLE_RECENT_WINDOW = 2 


SCALE_A_OPTIONS = ["Never", "Rarely", "Sometimes", "Often", "Very often"]
SCALE_B_OPTIONS = ["No days", "1-5 days", "6-12 days", "13-15 days", "Every day"]
SCALE_OPTIONS_BY_NAME = {"scale_a": SCALE_A_OPTIONS, "scale_b": SCALE_B_OPTIONS}

SCALE_A_DISPLAY_TO_MODEL_VALUE = {"Rarely": "Seldom"}


def normalize_answer_values(answers_dict: dict) -> dict:
    return {
        feature: SCALE_A_DISPLAY_TO_MODEL_VALUE.get(value, value)
        for feature, value in answers_dict.items()
    }



@app.get("/health")
def health():
    return {"status": "ok", "model_version": model.model_version}


@app.get("/questions")
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).order_by(Question.display_order).all()
    return [
        {"feature": q.code, "text": q.text, "options": SCALE_OPTIONS_BY_NAME[q.response_scale]}
        for q in questions
    ]


@app.post("/predict")
def predict(answers: BehaviorAnswers):
    answers_dict = normalize_answer_values(answers.model_dump())
    try:
        result = predict_behavioral_cluster(answers_dict, model=model)
    except InputValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result



@app.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(func.lower(User.email) == body.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    user = User(
        name=body.name,
        email=body.email,
        password_hash=body.password,
        message_frequency="weekly",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": user.id, "name": user.name, "email": user.email}


@app.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == body.email).first()
    if not user or user.password_hash != body.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"user_id": user.id, "name": user.name, "email": user.email}


@app.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    user.password_hash = body.new_password
    db.commit()

    return {"message": "Password reset successfully"}



@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "message_frequency": u.message_frequency}
        for u in users
    ]


@app.put("/users/{user_id}")
def update_user(user_id: int, body: UpdateUserRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(User).filter(func.lower(User.email) == body.email, User.id != user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already in use")

    user.name = body.name
    user.email = body.email
    db.commit()
    db.refresh(user)

    return {"id": user.id, "name": user.name, "email": user.email}


@app.put("/users/{user_id}/password")
def change_password(user_id: int, body: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.password_hash != body.current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.password_hash = body.new_password
    db.commit()

    return {"message": "Password changed successfully"}


@app.delete("/users/by-email")
def delete_user_by_email(body: DeleteUserByEmailRequest, db: Session = Depends(get_db)):
    """Admin/testing utility: permanently deletes a user and all of their data."""
    user = db.query(User).filter(func.lower(User.email) == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user.id

    user.proteins = []
    user.vegetables = []
    db.flush()

    db.query(WeeklyCheckin).filter(WeeklyCheckin.user_id == user_id).delete(synchronize_session=False)

    meal_plan_ids = [mp.id for mp in db.query(MealPlan).filter(MealPlan.user_id == user_id).all()]
    if meal_plan_ids:
        db.query(MealPlanItem).filter(MealPlanItem.meal_plan_id.in_(meal_plan_ids)).delete(synchronize_session=False)
    db.query(MealPlan).filter(MealPlan.user_id == user_id).delete(synchronize_session=False)

    profile_ids = [bp.id for bp in db.query(BehaviorProfile).filter(BehaviorProfile.user_id == user_id).all()]
    if profile_ids:
        db.query(QuestionnaireAnswer).filter(
            QuestionnaireAnswer.behavior_profile_id.in_(profile_ids)
        ).delete(synchronize_session=False)
    db.query(BehaviorProfile).filter(BehaviorProfile.user_id == user_id).delete(synchronize_session=False)

    db.query(UserMessage).filter(UserMessage.user_id == user_id).delete(synchronize_session=False)

    db.delete(user)
    db.commit()

    return {"message": "User and all related data deleted successfully", "email": body.email}



@app.get("/proteins")
def get_proteins(db: Session = Depends(get_db)):
    proteins = db.query(Protein).all()
    return [{"id": p.id, "name": p.name} for p in proteins]


@app.get("/vegetables")
def get_vegetables(db: Session = Depends(get_db)):
    vegetables = db.query(Vegetable).all()
    return [{"id": v.id, "name": v.name} for v in vegetables]


@app.get("/foods")
def get_foods(db: Session = Depends(get_db)):
    foods = db.query(Food).all()
    return [
        {"id": f.id, "name": f.name, "protein": f.protein.name, "meal_type": f.meal_type}
        for f in foods
    ]



@app.put("/users/{user_id}/proteins")
def set_user_proteins(user_id: int, body: ProteinIdsRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    proteins = db.query(Protein).filter(Protein.id.in_(body.protein_ids)).all()
    if len(proteins) != len(set(body.protein_ids)):
        raise HTTPException(status_code=400, detail="One or more protein_ids are invalid")

    previous_protein_ids = {protein.id for protein in user.proteins}
    preferences_changed = previous_protein_ids != set(body.protein_ids)

    user.proteins = proteins

    has_active_plan = (
        db.query(MealPlan).filter(MealPlan.user_id == user_id, MealPlan.is_active == True).first()
        is not None
    )
    if preferences_changed and has_active_plan and user.vegetables:
        generate_meal_plan(db, user_id)
    else:
        db.commit()

    return {"user_id": user.id, "proteins": [p.name for p in user.proteins]}


@app.put("/users/{user_id}/vegetables")
def set_user_vegetables(user_id: int, body: VegetableIdsRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    vegetables = db.query(Vegetable).filter(Vegetable.id.in_(body.vegetable_ids)).all()
    if len(vegetables) != len(set(body.vegetable_ids)):
        raise HTTPException(status_code=400, detail="One or more vegetable_ids are invalid")

    previous_vegetable_ids = {vegetable.id for vegetable in user.vegetables}
    preferences_changed = previous_vegetable_ids != set(body.vegetable_ids)

    user.vegetables = vegetables

    has_active_plan = (
        db.query(MealPlan).filter(MealPlan.user_id == user_id, MealPlan.is_active == True).first()
        is not None
    )
    if preferences_changed and has_active_plan and user.proteins:
        generate_meal_plan(db, user_id)
    else:
        db.commit()

    return {"user_id": user.id, "vegetables": [v.name for v in user.vegetables]}


@app.get("/users/{user_id}/food-preferences")
def get_user_food_preferences(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.id,
        "proteins": [{"id": p.id, "name": p.name} for p in user.proteins],
        "vegetables": [{"id": v.id, "name": v.name} for v in user.vegetables],
    }



def build_meal_plan_detail(db: Session, meal_plan: MealPlan) -> dict:
    items = db.query(MealPlanItem).filter(MealPlanItem.meal_plan_id == meal_plan.id).all()

    
    meals_by_day: dict[int, dict[int, dict]] = {}
    for item in items:
        day_meals = meals_by_day.setdefault(item.week_number, {}).setdefault(item.day_number, {})

        food = db.query(Food).filter(Food.id == item.food_id).first()
        meal = {"food_id": food.id, "food_name": food.name}

        if item.vegetable_id is not None:
            vegetable = db.query(Vegetable).filter(Vegetable.id == item.vegetable_id).first()
            meal["vegetable_id"] = vegetable.id
            meal["vegetable_name"] = vegetable.name

        day_meals[item.meal_type] = meal

    weeks = []
    for week_number in sorted(meals_by_day):
        days = []
        for day_number in sorted(meals_by_day[week_number]):
            day_meals = meals_by_day[week_number][day_number]
            days.append({
                "day_number": day_number,
                "breakfast": day_meals.get("breakfast"),
                "lunch": day_meals.get("lunch"),
                "dinner": day_meals.get("dinner"),
            })
        weeks.append({"week_number": week_number, "days": days})

    return {
        "meal_plan_id": meal_plan.id,
        "start_date": str(meal_plan.start_date),
        "is_active": meal_plan.is_active,
        "weeks": weeks,
    }


def choose_balanced_item(candidates, usage_count, recent_ids, penalty=RECENT_REPEAT_PENALTY):
    scored = [
        (usage_count.get(item.id, 0) + (penalty if item.id in recent_ids else 0), item)
        for item in candidates
    ]
    min_score = min(score for score, _ in scored)
    best_candidates = [item for score, item in scored if score == min_score]
    return random.choice(best_candidates)


def record_usage(usage_count, recent_ids, chosen_id, window_size):
    usage_count[chosen_id] = usage_count.get(chosen_id, 0) + 1
    recent_ids.append(chosen_id)
    if len(recent_ids) > window_size:
        recent_ids.pop(0)


def generate_meal_plan(db: Session, user_id: int, start_date: date | None = None) -> MealPlan:
    """Deactivates any existing active meal plan(s) for the user and generates a fresh
    4-week meal plan from their current protein/vegetable preferences. Shared by the
    meal-plan creation endpoint and by preference updates that must regenerate the plan."""
    plan_start_date = start_date or date.today()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    protein_ids = [protein.id for protein in user.proteins]
    vegetables = user.vegetables

    if not protein_ids:
        raise HTTPException(status_code=400, detail="User has no protein preferences")
    if not vegetables:
        raise HTTPException(status_code=400, detail="User has no vegetable preferences")

    breakfast_foods = (
        db.query(Food).filter(Food.meal_type == "breakfast", Food.protein_id.in_(protein_ids)).all()
    )
    main_foods = db.query(Food).filter(Food.meal_type == "main", Food.protein_id.in_(protein_ids)).all()

    if not breakfast_foods:
        raise HTTPException(status_code=400, detail="No breakfast food matches the user's protein preferences")
    if not main_foods:
        raise HTTPException(status_code=400, detail="No main food matches the user's protein preferences")

    try:
        old_active_plans = (
            db.query(MealPlan).filter(MealPlan.user_id == user_id, MealPlan.is_active == True).all()  
        )
        for old_plan in old_active_plans:
            old_plan.is_active = False

        new_plan = MealPlan(user_id=user_id, start_date=plan_start_date, is_active=True)
        db.add(new_plan)
        db.flush() 

        breakfast_usage, lunch_usage, dinner_usage, vegetable_usage = {}, {}, {}, {}
        recent_breakfasts, recent_lunches, recent_dinners, recent_vegetables = [], [], [], []

        for week_number in range(1, MEAL_PLAN_WEEKS + 1):
            for day_number in range(1, MEAL_PLAN_DAYS_PER_WEEK + 1):
                breakfast_food = choose_balanced_item(breakfast_foods, breakfast_usage, recent_breakfasts)
                record_usage(breakfast_usage, recent_breakfasts, breakfast_food.id, BREAKFAST_RECENT_WINDOW)
                db.add(MealPlanItem(
                    meal_plan_id=new_plan.id, week_number=week_number, day_number=day_number,
                    meal_type="breakfast", food_id=breakfast_food.id, vegetable_id=None,
                ))

                lunch_food = choose_balanced_item(main_foods, lunch_usage, recent_lunches)
                record_usage(lunch_usage, recent_lunches, lunch_food.id, LUNCH_RECENT_WINDOW)

                lunch_vegetable = choose_balanced_item(vegetables, vegetable_usage, recent_vegetables)
                record_usage(vegetable_usage, recent_vegetables, lunch_vegetable.id, VEGETABLE_RECENT_WINDOW)

                db.add(MealPlanItem(
                    meal_plan_id=new_plan.id, week_number=week_number, day_number=day_number,
                    meal_type="lunch", food_id=lunch_food.id, vegetable_id=lunch_vegetable.id,
                ))

                
                dinner_candidates = [food for food in main_foods if food.id != lunch_food.id] or main_foods
                dinner_food = choose_balanced_item(dinner_candidates, dinner_usage, recent_dinners)
                record_usage(dinner_usage, recent_dinners, dinner_food.id, DINNER_RECENT_WINDOW)

                dinner_vegetable_candidates = (
                    [vegetable for vegetable in vegetables if vegetable.id != lunch_vegetable.id] or vegetables
                )
                dinner_vegetable = choose_balanced_item(
                    dinner_vegetable_candidates, vegetable_usage, recent_vegetables
                )
                record_usage(vegetable_usage, recent_vegetables, dinner_vegetable.id, VEGETABLE_RECENT_WINDOW)

                db.add(MealPlanItem(
                    meal_plan_id=new_plan.id, week_number=week_number, day_number=day_number,
                    meal_type="dinner", food_id=dinner_food.id, vegetable_id=dinner_vegetable.id,
                ))

        db.commit()
    except Exception:
        db.rollback()
        raise

    return new_plan


@app.post("/users/{user_id}/meal-plans")
def create_meal_plan(user_id: int, body: MealPlanRequest, db: Session = Depends(get_db)):
    new_plan = generate_meal_plan(db, user_id, body.start_date)

    meals_created = db.query(MealPlanItem).filter(MealPlanItem.meal_plan_id == new_plan.id).count()

    return {
        "message": "Meal plan generated successfully",
        "meal_plan_id": new_plan.id,
        "start_date": str(new_plan.start_date),
        "is_active": new_plan.is_active,
        "weeks": MEAL_PLAN_WEEKS,
        "days": MEAL_PLAN_WEEKS * MEAL_PLAN_DAYS_PER_WEEK,
        "meals": meals_created,
    }


@app.get("/users/{user_id}/meal-plan")
def get_active_meal_plan(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    active_plan = (
        db.query(MealPlan).filter(MealPlan.user_id == user_id, MealPlan.is_active == True).first() 
    )
    if not active_plan:
        raise HTTPException(status_code=404, detail="No active meal plan found")

    return build_meal_plan_detail(db, active_plan)


@app.get("/users/{user_id}/meal-plans")
def get_meal_plan_history(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plans = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == user_id)
        .order_by(MealPlan.id.desc())  
        .all()
    )

    summaries = []
    for plan in plans:
        meals_count = db.query(MealPlanItem).filter(MealPlanItem.meal_plan_id == plan.id).count()
        summaries.append({
            "id": plan.id,
            "start_date": str(plan.start_date),
            "is_active": plan.is_active,
            "meals_count": meals_count,
        })
    return summaries


@app.get("/meal-plans/{meal_plan_id}")
def get_meal_plan_by_id(meal_plan_id: int, db: Session = Depends(get_db)):
    meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    return build_meal_plan_detail(db, meal_plan)



def build_weekly_checkin_response(checkin: WeeklyCheckin) -> dict:
    return {
        "id": checkin.id,
        "user_id": checkin.user_id,
        "meal_plan_id": checkin.meal_plan_id,
        "week_number": checkin.week_number,
        "adherence_level": checkin.adherence_level,
        "score": checkin.score,
        "checkin_date": str(checkin.checkin_date),
    }


@app.post("/users/{user_id}/weekly-checkins")
def create_weekly_checkin(user_id: int, body: WeeklyCheckinRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    meal_plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == body.meal_plan_id, MealPlan.user_id == user_id)
        .first()
    )
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    existing = (
        db.query(WeeklyCheckin)
        .filter(
            WeeklyCheckin.meal_plan_id == body.meal_plan_id,
            WeeklyCheckin.week_number == body.week_number,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A check-in for this week already exists")

    checkin = WeeklyCheckin(
        user_id=user_id,
        meal_plan_id=body.meal_plan_id,
        week_number=body.week_number,
        adherence_level=body.adherence_level,
        score=WEEKLY_CHECKIN_SCORES[body.adherence_level],
        checkin_date=date.today(),
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    return build_weekly_checkin_response(checkin)


@app.get("/users/{user_id}/weekly-checkins")
def get_weekly_checkins(user_id: int, meal_plan_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    checkins = (
        db.query(WeeklyCheckin)
        .filter(WeeklyCheckin.user_id == user_id, WeeklyCheckin.meal_plan_id == meal_plan_id)
        .order_by(WeeklyCheckin.week_number)
        .all()
    )
    return [build_weekly_checkin_response(c) for c in checkins]


@app.get("/users/{user_id}/meal-plan-adherence")
def get_meal_plan_adherence(user_id: int, meal_plan_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    meal_plan = (
        db.query(MealPlan).filter(MealPlan.id == meal_plan_id, MealPlan.user_id == user_id).first()
    )
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    checkins = (
        db.query(WeeklyCheckin)
        .filter(WeeklyCheckin.user_id == user_id, WeeklyCheckin.meal_plan_id == meal_plan_id)
        .all()
    )
    checkin_by_week = {c.week_number: c for c in checkins}

    days_elapsed = (date.today() - meal_plan.start_date).days
    if days_elapsed < 0:
        current_week = 1
    elif days_elapsed > 27:
        current_week = MEAL_PLAN_WEEKS
    else:
        current_week = (days_elapsed // 7) + 1
    plan_completed = days_elapsed > 27

    weeks = []
    total_score = 0
    for week_number in range(1, MEAL_PLAN_WEEKS + 1):
        checkin = checkin_by_week.get(week_number)

        available_at_days_elapsed = week_number * 7 - 1
        if checkin:
            state = "completed"
        elif days_elapsed >= available_at_days_elapsed:
            state = "ready"
        else:
            state = "not-available"

        if checkin:
            weeks.append({
                "week_number": week_number,
                "state": state,
                "adherence_level": checkin.adherence_level,
                "score": checkin.score,
                "checkin_date": str(checkin.checkin_date),
            })
            total_score += checkin.score
        else:
            weeks.append({
                "week_number": week_number,
                "state": state,
                "adherence_level": None,
                "score": None,
                "checkin_date": None,
            })

    return {
        "meal_plan_id": meal_plan_id,
        "current_week": current_week,
        "plan_completed": plan_completed,
        "weeks": weeks,
        "total_score": total_score,
    }



def build_behavior_profile_detail(db: Session, profile: BehaviorProfile) -> dict:
    questions = db.query(Question).order_by(Question.display_order).all()
    answers = (
        db.query(QuestionnaireAnswer)
        .filter(QuestionnaireAnswer.behavior_profile_id == profile.id)
        .all()
    )
    answer_by_question_id = {answer.question_id: answer.answer for answer in answers}

    answers_list = []
    for question in questions:
        if question.id in answer_by_question_id:
            answers_list.append({
                "question_id": question.id,
                "code": question.code,
                "text": question.text,
                "answer": answer_by_question_id[question.id],
            })

    return {
        "behavior_profile_id": profile.id,
        "user_id": profile.user_id,
        "behavior_cluster": profile.behavior_cluster,
        "created_at": profile.created_at.isoformat(),
        "answers": answers_list,
    }


@app.post("/users/{user_id}/behavior-profiles")
def create_behavior_profile(user_id: int, answers: BehaviorAnswers, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    questions = db.query(Question).order_by(Question.display_order).all()
    answers_dict = normalize_answer_values(answers.model_dump())
    if len(questions) != 10 or {q.code for q in questions} != set(answers_dict.keys()):
        raise HTTPException(
            status_code=500,
            detail="The questions table does not contain exactly the 10 expected question codes",
        )

    try:
        result = predict_behavioral_cluster(answers_dict, model=model)
    except InputValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        profile = BehaviorProfile(user_id=user_id, behavior_cluster=result["semantic_cluster"])
        db.add(profile)
        db.flush() 

        for question in questions:
            db.add(QuestionnaireAnswer(
                behavior_profile_id=profile.id,
                question_id=question.id,
                answer=answers_dict[question.code],
            ))

        db.commit()
    except Exception:
        db.rollback()
        raise

    if user.message_frequency != "off":
        latest_message = get_latest_user_message(db, user_id)
        previous_message_id = latest_message.message_id if latest_message else None
        select_and_save_motivational_message(db, user_id, profile.behavior_cluster, previous_message_id)

    answers_count = (
        db.query(QuestionnaireAnswer).filter(QuestionnaireAnswer.behavior_profile_id == profile.id).count()
    )

    return {
        "message": "Behavior profile created successfully",
        "behavior_profile_id": profile.id,
        "user_id": profile.user_id,
        "behavior_cluster": profile.behavior_cluster,
        "created_at": profile.created_at.isoformat(),
        "answers_count": answers_count,
        "prediction": result,
    }


@app.get("/users/{user_id}/behavior-profile")
def get_latest_behavior_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    latest_profile = (
        db.query(BehaviorProfile)
        .filter(BehaviorProfile.user_id == user_id)
        .order_by(BehaviorProfile.id.desc())
        .first()
    )
    if not latest_profile:
        raise HTTPException(status_code=404, detail="User has no behavior profile yet")

    return build_behavior_profile_detail(db, latest_profile)


@app.get("/users/{user_id}/behavior-profiles")
def get_behavior_profile_history(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profiles = (
        db.query(BehaviorProfile)
        .filter(BehaviorProfile.user_id == user_id)
        .order_by(BehaviorProfile.id.desc())  
        .all()
    )
    return [
        {"id": p.id, "behavior_cluster": p.behavior_cluster, "created_at": p.created_at.isoformat()}
        for p in profiles
    ]


@app.get("/behavior-profiles/{behavior_profile_id}")
def get_behavior_profile_by_id(behavior_profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(BehaviorProfile).filter(BehaviorProfile.id == behavior_profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Behavior profile not found")

    return build_behavior_profile_detail(db, profile)



def get_latest_user_message(db: Session, user_id: int):
    return (
        db.query(UserMessage)
        .filter(UserMessage.user_id == user_id)
        .order_by(UserMessage.id.desc())
        .first()
    )


def choose_motivational_message(db: Session, user_id: int, behavior_cluster: str, previous_message_id: int | None):
    cluster_messages = (
        db.query(MotivationalMessage).filter(MotivationalMessage.behavior_cluster == behavior_cluster).all()
    )
    if not cluster_messages:
        return None

    seen_ids = {
        message_id
        for (message_id,) in (
            db.query(UserMessage.message_id)
            .join(MotivationalMessage, UserMessage.message_id == MotivationalMessage.id)
            .filter(UserMessage.user_id == user_id, MotivationalMessage.behavior_cluster == behavior_cluster)
            .all()
        )
    }
    unseen = [m for m in cluster_messages if m.id not in seen_ids]
    if unseen:
        return random.choice(unseen)


    candidates = cluster_messages
    if previous_message_id is not None and len(candidates) > 1:
        candidates = [m for m in candidates if m.id != previous_message_id] or candidates
    return random.choice(candidates)


def select_and_save_motivational_message(db: Session, user_id: int, behavior_cluster: str, previous_message_id: int | None):
    chosen = choose_motivational_message(db, user_id, behavior_cluster, previous_message_id)
    if not chosen:
        return None, None

    user_message = UserMessage(user_id=user_id, message_id=chosen.id)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    return user_message, chosen


@app.get("/users/{user_id}/motivational-message")
def get_motivational_message_for_display(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.message_frequency == "off":
        return {"message": None}

    latest_profile = (
        db.query(BehaviorProfile)
        .filter(BehaviorProfile.user_id == user_id)
        .order_by(BehaviorProfile.id.desc())
        .first()
    )
    if not latest_profile:
        raise HTTPException(status_code=404, detail="User has no behavior profile")

    latest_message = get_latest_user_message(db, user_id)
    current_message = (
        db.query(MotivationalMessage).filter(MotivationalMessage.id == latest_message.message_id).first()
        if latest_message
        else None
    )

    interval = MESSAGE_FREQUENCY_INTERVALS[user.message_frequency]
    expired = latest_message is not None and datetime.utcnow() >= latest_message.sent_at + interval
    needs_new_message = (
        latest_message is None
        or current_message.behavior_cluster != latest_profile.behavior_cluster
        or expired
    )

    if needs_new_message:
        previous_message_id = latest_message.message_id if latest_message else None
        user_message, message = select_and_save_motivational_message(
            db, user_id, latest_profile.behavior_cluster, previous_message_id
        )
        if not user_message:
            raise HTTPException(
                status_code=404,
                detail=f"No motivational messages found for cluster '{latest_profile.behavior_cluster}'",
            )
        changed = True
    else:
        user_message, message = latest_message, current_message
        changed = False

    next_change_at = user_message.sent_at + interval
    return {
        "message": message.message,
        "cluster": message.behavior_cluster,
        "message_id": message.id,
        "sent_at": user_message.sent_at.isoformat(),
        "updated_at": user_message.sent_at.isoformat(),
        "next_change_at": next_change_at.isoformat(),
        "changed": changed,
    }


@app.put("/users/{user_id}/message-frequency")
def set_message_frequency(user_id: int, body: MessageFrequencyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.message_frequency = body.message_frequency
    db.commit()

    return {"user_id": user.id, "message_frequency": user.message_frequency}


@app.get("/users/{user_id}/onboarding-status")
def get_onboarding_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.proteins:
        return {"completed": False, "next_step": "proteins"}

    if not user.vegetables:
        return {"completed": False, "next_step": "vegetables"}

    has_behavior_profile = (
        db.query(BehaviorProfile).filter(BehaviorProfile.user_id == user_id).first() is not None
    )
    if not has_behavior_profile:
        return {"completed": False, "next_step": "questionnaire"}

    has_active_meal_plan = (
        db.query(MealPlan).filter(MealPlan.user_id == user_id, MealPlan.is_active == True).first()
        is not None
    )
    if not has_active_meal_plan:
        return {"completed": False, "next_step": "result"}

    return {"completed": True, "next_step": "dashboard"}


@app.get("/users/{user_id}/dashboard")
def get_user_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_info = {
        "name": user.name,
        "email": user.email,
        "message_frequency": user.message_frequency,
    }


    latest_profile = (
        db.query(BehaviorProfile)
        .filter(BehaviorProfile.user_id == user_id)
        .order_by(BehaviorProfile.id.desc())
        .first()
    )
    behavior_profile_info = None
    if latest_profile:
        behavior_profile_info = {
            "behavior_cluster": latest_profile.behavior_cluster,
            "created_at": latest_profile.created_at.isoformat(),
        }

    food_preferences_info = {
        "proteins": [{"id": p.id, "name": p.name} for p in user.proteins],
        "vegetables": [{"id": v.id, "name": v.name} for v in user.vegetables],
    }


    active_plan = (
        db.query(MealPlan).filter(MealPlan.user_id == user_id, MealPlan.is_active == True).first()  
    )
    meal_plan_info = None
    if active_plan:
        meal_plan_info = {"meal_plan_id": active_plan.id, "start_date": str(active_plan.start_date)}

    last_user_message = get_latest_user_message(db, user_id)
    last_message_info = None
    if last_user_message:
        message = (
            db.query(MotivationalMessage).filter(MotivationalMessage.id == last_user_message.message_id).first()
        )
        last_message_info = {"message": message.message, "sent_at": last_user_message.sent_at.isoformat()}

    return {
        "user": user_info,
        "behavior_profile": behavior_profile_info,
        "food_preferences": food_preferences_info,
        "meal_plan": meal_plan_info,
        "last_message": last_message_info,
    }

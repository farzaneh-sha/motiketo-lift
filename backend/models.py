from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Date, Float, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    message_frequency = Column(String, nullable=False)

    proteins = relationship("Protein", secondary="user_proteins", back_populates="users")
    vegetables = relationship("Vegetable", secondary="user_vegetables", back_populates="users")
    behavior_profiles = relationship("BehaviorProfile", back_populates="user")
    meal_plans = relationship("MealPlan", back_populates="user")
    messages = relationship("UserMessage", back_populates="user")



class Protein(Base):
    __tablename__ = "proteins"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)


    users = relationship("User", secondary="user_proteins", back_populates="proteins")
    foods = relationship("Food", back_populates="protein")


class Vegetable(Base):
    __tablename__ = "vegetables"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", secondary="user_vegetables", back_populates="vegetables")


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    protein_id = Column(Integer, ForeignKey("proteins.id"), nullable=False)


    meal_type = Column(String, nullable=False)

    protein = relationship("Protein", back_populates="foods")




user_proteins = Table(
    "user_proteins",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("protein_id", Integer, ForeignKey("proteins.id"), primary_key=True),
)

user_vegetables = Table(
    "user_vegetables",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("vegetable_id", Integer, ForeignKey("vegetables.id"), primary_key=True),
)



class BehaviorProfile(Base):
    __tablename__ = "behavior_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    behavior_cluster = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="behavior_profiles")
    answers = relationship("QuestionnaireAnswer", back_populates="behavior_profile")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)

    code = Column(String, unique=True, nullable=False)
    text = Column(String, nullable=False)

    response_scale = Column(String, nullable=False)

    display_order = Column(Integer, nullable=False)

    answers = relationship("QuestionnaireAnswer", back_populates="question")


class QuestionnaireAnswer(Base):
    __tablename__ = "questionnaire_answers"

    id = Column(Integer, primary_key=True)
    behavior_profile_id = Column(Integer, ForeignKey("behavior_profiles.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    answer = Column(String, nullable=False)

    behavior_profile = relationship("BehaviorProfile", back_populates="answers")
    question = relationship("Question", back_populates="answers")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="meal_plans")
    items = relationship("MealPlanItem", back_populates="meal_plan")


class MealPlanItem(Base):
    __tablename__ = "meal_plan_items"

    id = Column(Integer, primary_key=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"), nullable=False)

    week_number = Column(Integer, nullable=False)  
    day_number = Column(Integer, nullable=False)  

    meal_type = Column(String, nullable=False)

    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)

    vegetable_id = Column(Integer, ForeignKey("vegetables.id"), nullable=True)

    meal_plan = relationship("MealPlan", back_populates="items")
    food = relationship("Food")
    vegetable = relationship("Vegetable")


class MotivationalMessage(Base):
    __tablename__ = "motivational_messages"

    id = Column(Integer, primary_key=True)

    behavior_cluster = Column(String, nullable=False)
    message = Column(String, nullable=False)

    user_messages = relationship("UserMessage", back_populates="message")


class UserMessage(Base):

    __tablename__ = "user_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_id = Column(Integer, ForeignKey("motivational_messages.id"), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)


    user = relationship("User", back_populates="messages")
    message = relationship("MotivationalMessage", back_populates="user_messages")


class WeeklyCheckin(Base):
    __tablename__ = "weekly_checkins"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"), nullable=False)
    week_number = Column(Integer, nullable=False)  

    adherence_level = Column(String, nullable=False)
    score = Column(Float, nullable=False)  
    checkin_date = Column(Date, nullable=False)


    user = relationship("User")
    meal_plan = relationship("MealPlan")

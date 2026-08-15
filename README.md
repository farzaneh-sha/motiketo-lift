# MotiKeto Lift

**MotiKeto Lift** is a web application that combines behavioral analysis, machine learning, personalized keto meal planning, and motivational messaging to create a more personalized user experience.

Instead of providing the same experience to every user, the application collects behavioral questionnaire responses, uses a trained machine learning model to identify the user's behavioral profile, and uses that profile as part of the personalization process.

## Key Features

* User registration and authentication
* Personalized food preferences
* Protein and vegetable selection
* Behavioral questionnaire
* Machine-learning-based behavioral clustering
* Personalized behavioral profile
* Monthly keto meal plan generation
* Daily meal overview
* Motivational messages based on behavioral profile
* Configurable motivational message frequency
* Monthly check-ins
* Profile and preference management
* Responsive, mobile-first user interface

## How It Works

The main user flow is:

1. Create an account
2. Select preferred protein sources
3. Select preferred vegetables
4. Complete the behavioral questionnaire
5. Analyze responses using the trained ML model
6. Assign the user to a behavioral cluster
7. Generate a personalized keto meal plan
8. Display motivational messages based on the user's behavioral profile
9. Perform monthly check-ins and continue the personalized experience

## Machine Learning

The behavioral analysis component is based on a clustering pipeline developed from behavioral questionnaire data.

The original behavioral dataset was analyzed and reduced to a final set of **10 behavioral questions** representing important behavioral dimensions.

A **K-Means clustering model** is used to classify new questionnaire responses into one of two interpretable behavioral profiles:

* `higher_concern`
* `lower_concern`

The trained model is integrated into the backend and performs inference when a user completes the behavioral questionnaire.

## Project Structure


motiketo-lift/
├── frontend/       # Next.js web application
├── backend/        # FastAPI backend and application logic
├── ml/             # Machine learning research and model development
├── .gitignore
└── README.md



### Behavioral Assessment

Users answer a short behavioral questionnaire. Their responses are processed by the trained machine learning model to determine their behavioral profile.

### Food Preferences

Users select preferred protein sources and vegetables. These preferences are stored and used during meal-plan generation.

### Personalized Meal Planning

The application generates a structured four-week keto meal plan using the user's selected food preferences.

Each day contains:

* Breakfast
* Lunch
* Dinner

### Motivational Messaging

Motivational messages are associated with behavioral profiles and can be delivered according to the user's selected frequency.

Supported frequencies include:

* Weekly
* Biweekly
* Monthly
* Quarterly
* Off

### Monthly Check-ins

Users can periodically report their adherence level, allowing the application to maintain an ongoing behavioral and dietary experience.

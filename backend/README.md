# MotiKeto Lift — Backend

## 1. What does this backend do?

It's a small FastAPI web API that sits between a frontend and the machine-learning model
already trained in this project 
```
Frontend  -->  FastAPI (this backend)  -->  behavioral_model package  -->  saved model
```

The backend itself contains **no machine-learning code** — it just loads the ready-made model
and calls the ready-made `predict_behavioral_cluster()` function.

## 2. Install dependencies

From the `backend/` folder:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```powershell
# PowerShell
.venv\Scripts\Activate
```


```bash
pip install -r requirements.txt
```


## 3. Database

A SQLite database (`motiket_lift.db`, created automatically) stores users, meal plans, behavior
profiles, and related data. The tables are defined in `models.py` using plain SQLAlchemy models
— one Python class per table. `database.py` sets up the connection; 

To (re-)populate the starter data (6 proteins + the 10 questions) run:


```bash
python seed.py
```

```bash
python import_food_data.py
```

It's safe to run more than once — it checks what already exists before inserting anything.
Vegetables and Foods tables exist but are intentionally left empty for now; this project doesn't
have a food-list data source yet.


## 4. Run the server

```bash
cd backend
uvicorn main:app --reload
```

## 5. Where's Swagger?

Open **/docs** in your browser. FastAPI auto-generates an interactive
page there where you can try every endpoint without writing any code.


## 6. Endpoints

### `GET /health`
Quick check that the API is running and which model version it loaded.
```json
{"status": "ok", "model_version": "behavioral-kmeans-v1.0.0"}
```

### `GET /questions`
Returns the 10 questions (text + allowed answer options) a frontend should ask the user.
Still just a Python list in `main.py` for now, not read from the database.

### `POST /predict`
Send the user's 10 answers, get back their behavioral cluster.

**Request body:**
```json
{
  "Days_FearLosingControlOverEating": "No days",
  "Days_ExcludedFoodControlShapeOrWeight": "1-5 days",
  "Days_TriedLimitFoodControlShapeOrWeight": "6-12 days",
  "Days_FollowedRulesControlShapeOrWeight": "1-5 days",
  "Days_FeltFat": "1-5 days",
  "EatLess_ToPreventWeightGain": "Sometimes",
  "EatLess_AfterOvereating": "Seldom",
  "AvoidEveningEating_ToWatchWeight": "Never",
  "Eat_WhenAnxious": "Often",
  "Eat_WhenThingsGoWrong": "Sometimes"
}
```

**Response:**
```json
{
  "semantic_cluster": "lower_concern",
  "raw_cluster_id": 1,
  "assignment_strength": 0.58,
  "distance_to_assigned_centroid": 3.44,
  "is_borderline": true,
  "is_unusual_profile": false,
  "model_version": "behavioral-kmeans-v1.0.0"
}
```




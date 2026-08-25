from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
import hashlib
import os
import smtplib
from email.message import EmailMessage
from typing import List
import jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from backend.database import connect_to_mongo, close_mongo_connection, get_database
from backend.models import (
    UserRegister, UserLogin, UserModel, UserUpdate, AddressModel, OrderModel, NewsletterSubscribe,
    HomePageContentModel
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close Connection
    await close_mongo_connection()

app = FastAPI(
    title="Sparkle Stream Cleaner Backend",
    description="FastAPI Backend with MongoDB Connection",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS so the frontend can interact with the backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific origins in a production environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Sparkle Stream Cleaner API",
        "status": "online"
    }

@app.get("/health")
async def health_check(db=Depends(get_database)):
    if db is None:
        return {"status": "unhealthy", "mongodb": "disconnected"}
    try:
        # Ping the database to verify connectivity
        await db.command("ping")
        return {
            "status": "healthy",
            "mongodb": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "mongodb": f"error: {str(e)}"
        }

@app.post("/api/test-db")
async def test_db_interaction(db=Depends(get_database)):
    if db is None:
        return {"error": "Database not initialized"}
    try:
        # Insert a test document
        test_collection = db["test_connection"]
        result = await test_collection.insert_one({"message": "Hello from FastAPI!", "status": "success"})
        
        # Read it back
        doc = await test_collection.find_one({"_id": result.inserted_id})
        
        # Delete it to clean up
        await test_collection.delete_one({"_id": result.inserted_id})
        
        return {
            "success": True,
            "message": "Successfully verified write and read operations in MongoDB!",
            "data": {
                "inserted_id": str(result.inserted_id),
                "retrieved_message": doc.get("message")
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/products")
async def get_products(db=Depends(get_database)):
    cursor = db["products"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/products/{slug}")
async def get_product(slug: str, db=Depends(get_database)):
    return await db["products"].find_one({"slug": slug}, {"_id": 0})

@app.get("/api/flavours")
async def get_flavours(db=Depends(get_database)):
    cursor = db["flavours"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/goals")
async def get_goals(db=Depends(get_database)):
    cursor = db["goals"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/reviews")
async def get_reviews(db=Depends(get_database)):
    cursor = db["reviews"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/faqs")
async def get_faqs(db=Depends(get_database)):
    cursor = db["faqs"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/posts")
async def get_posts(db=Depends(get_database)):
    cursor = db["posts"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/posts/{slug}")
async def get_post(slug: str, db=Depends(get_database)):
    return await db["posts"].find_one({"slug": slug}, {"_id": 0})

@app.get("/api/policies")
async def get_policies(db=Depends(get_database)):
    cursor = db["policies"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/policies/{slug}")
async def get_policy(slug: str, db=Depends(get_database)):
    return await db["policies"].find_one({"slug": slug}, {"_id": 0})

@app.get("/api/brand-values")
async def get_brand_values(db=Depends(get_database)):
    cursor = db["brand_values"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/milestones")
async def get_milestones(db=Depends(get_database)):
    cursor = db["milestones"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/content/home", response_model=HomePageContentModel)
async def get_home_content(db=Depends(get_database)):
    content = await db["home_content"].find_one({}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Home content not found")
    return content

# -------------------------------------------------------------------
# Auth & User Endpoints
# -------------------------------------------------------------------



JWT_SECRET = os.environ.get("JWT_SECRET", "sonrup_fallback_secret_key_2026")
JWT_ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_database)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = await db["users"].find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/api/auth/register")
async def register_user(req: UserRegister, db=Depends(get_database)):
    existing = await db["users"].find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = UserModel(
        email=req.email,
        name=req.name,
        password_hash=hash_password(req.password),
        phone=req.phone or "",
        addresses=[],
        orders=[]
    )
    await db["users"].insert_one(user.model_dump())
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/login")
async def login_user(req: UserLogin, db=Depends(get_database)):
    user = await db["users"].find_one({"email": req.email})
    if not user or user["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_my_profile(current_user=Depends(get_current_user), db=Depends(get_database)):
    orders_cursor = db["orders"].find({"customer_email": current_user["email"]}, {"_id": 0})
    user_orders = await orders_cursor.to_list(length=100)
    return {
        "email": current_user["email"],
        "name": current_user["name"],
        "phone": current_user.get("phone", ""),
        "addresses": current_user.get("addresses", []),
        "orders": user_orders
    }

@app.put("/api/user/profile")
async def update_my_profile(req: UserUpdate, current_user=Depends(get_current_user), db=Depends(get_database)):
    update_data = {}
    if req.name is not None:
        update_data["name"] = req.name
    if req.phone is not None:
        update_data["phone"] = req.phone
    if req.email is not None and req.email != current_user["email"]:
        # Check if new email already exists
        existing = await db["users"].find_one({"email": req.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data["email"] = req.email
        
    if not update_data:
        return {"success": True}
        
    result = await db["users"].update_one({"email": current_user["email"]}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"success": True}

@app.post("/api/user/addresses")
async def sync_my_addresses(addresses: List[AddressModel], current_user=Depends(get_current_user), db=Depends(get_database)):
    result = await db["users"].update_one(
        {"email": current_user["email"]},
        {"$set": {"addresses": [a.model_dump() for a in addresses]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}

@app.post("/api/orders")
async def create_order(order: OrderModel, db=Depends(get_database)):
    await db["orders"].insert_one(order.model_dump())
    return {"success": True, "order_id": order.id}

# -------------------------------------------------------------------
# Newsletter Endpoint
# -------------------------------------------------------------------

def send_welcome_email(email_address: str):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5151")
    
    if not smtp_host or not smtp_user or not smtp_pass:
        print("SMTP credentials not configured.")
        return

    msg = EmailMessage()
    msg["Subject"] = "Welcome to the Sonrup Gummy Club! 🎉"
    msg["From"] = f"Sonrup Nutrition <{smtp_user}>"
    msg["To"] = email_address

    # Plain text fallback
    msg.set_content(f"Welcome to Sonrup Nutrition!\n\nWe are thrilled to have you in the Gummy Club.\nEnjoy 10% off your first tube. Stay tuned for early access to our newest flavours and exclusive wellness tips.\n\nShop now: {frontend_url}\n\nStay healthy,\nThe Sonrup Team")

    # HTML content
    html_content = f"""\
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcf9f2; color: #1f1d1a; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
            .header {{ background-color: #1f1d1a; padding: 30px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -1px; }}
            .header h1 span {{ color: #eab308; }}
            .content {{ padding: 40px 30px; line-height: 1.6; font-size: 16px; color: #333333; }}
            .content h2 {{ color: #1f1d1a; font-size: 22px; margin-top: 0; }}
            .button-container {{ text-align: center; margin: 35px 0; }}
            .button {{ background-color: #eab308; color: #1f1d1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; }}
            .footer {{ background-color: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>sonrup<span>.</span></h1>
            </div>
            <div class="content">
                <h2>Welcome to the Gummy Club! 🎉</h2>
                <p>Hi there,</p>
                <p>We are absolutely thrilled to welcome you to the Sonrup family. You're now on the inside track for everything related to delicious, daily wellness.</p>
                <p>As a member of the Gummy Club, you'll be the first to hear about our newest real-fruit flavours, exclusive offers, and expert wellness tips.</p>
                <p>Ready to start your journey? Enjoy <strong>10% off</strong> your first tube by shopping today.</p>
                
                <div class="button-container">
                    <a href="{frontend_url}" class="button">Shop Now</a>
                </div>
                
                <p>Stay healthy, stay sparkling,</p>
                <p><strong>The Sonrup Team</strong></p>
            </div>
            <div class="footer">
                &copy; 2026 Sonrup Nutrition. All rights reserved.<br>
                If you didn't subscribe to this list, you can ignore this email.
            </div>
        </div>
    </body>
    </html>
    """
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email to {email_address}: {e}")

@app.post("/api/newsletter/subscribe")
async def subscribe_newsletter(req: NewsletterSubscribe, background_tasks: BackgroundTasks, db=Depends(get_database)):
    existing = await db["newsletter"].find_one({"email": req.email})
    if not existing:
        await db["newsletter"].insert_one({"email": req.email})
    
    # Always send the welcome email so the user can test multiple times
    background_tasks.add_task(send_welcome_email, req.email)
    
    return {"success": True, "message": "Subscribed successfully"}

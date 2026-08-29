from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
import hashlib
import os
import smtplib
import shutil
import uuid
from email.message import EmailMessage
from typing import List
import jwt
import razorpay
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import connect_to_mongo, close_mongo_connection, get_database
from backend.models import (
    UserRegister, UserLogin, UserModel, UserUpdate, AddressModel, OrderModel, NewsletterSubscribe,
    HomePageContentModel, AboutPageContentModel, ContactPageContentModel, JournalPageContentModel, PostModel, PolicyModel, ContactSubmissionModel, BroadcastPayload, IntegrationsModel, LoginPageContentModel,
    ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordOtpRequest
)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield

JWT_SECRET = os.environ.get("JWT_SECRET", "sonrup_fallback_secret_key_2026_super_secure")
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
        ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
        if email == ADMIN_USER:
            return {"email": ADMIN_USER, "name": "Admin User", "is_admin": True, "role": "admin"}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
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

@app.post("/api/admin/login")
async def admin_login(payload: dict):
    ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "admin123")
    if payload.get("username") == ADMIN_USER and payload.get("password") == ADMIN_PASS:
        # Issue a simple JWT token with admin flag
        token = jwt.encode(
            {"sub": ADMIN_USER, "admin": True, "exp": datetime.utcnow() + timedelta(hours=12)},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

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
    products = await cursor.to_list(length=100)
    for p in products:
        reviews_cursor = db["product_reviews"].find({"product_slug": p["slug"]})
        reviews = await reviews_cursor.to_list(length=1000)
        p["reviews"] = len(reviews)
        if len(reviews) > 0:
            p["rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
        else:
            p["rating"] = 5.0
    return products

@app.get("/api/products/{slug}")
async def get_product(slug: str, db=Depends(get_database)):
    product = await db["products"].find_one({"slug": slug}, {"_id": 0})
    if product:
        reviews_cursor = db["product_reviews"].find({"product_slug": slug})
        reviews = await reviews_cursor.to_list(length=1000)
        product["reviews"] = len(reviews)
        if len(reviews) > 0:
            product["rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
        else:
            product["rating"] = 5.0
    return product

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

@app.get("/api/product-reviews")
async def get_product_reviews(db=Depends(get_database)):
    cursor = db["product_reviews"].find()
    reviews = []
    async for r in cursor:
        r["_id"] = str(r["_id"])
        reviews.append(r)
    return reviews

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

from datetime import datetime

@app.post("/api/contact")
async def submit_contact(data: ContactSubmissionModel, db=Depends(get_database)):
    submission = data.dict()
    submission["createdAt"] = datetime.utcnow().isoformat() + "Z"
    await db["contact_messages"].insert_one(submission)
    return {"message": "Contact submission received successfully"}

@app.get("/api/brand-values")
async def get_brand_values(db=Depends(get_database)):
    cursor = db["brand_values"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.get("/api/milestones")
async def get_milestones(db=Depends(get_database)):
    cursor = db["milestones"].find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@app.put("/api/admin/content/home")
async def update_home_content(content: HomePageContentModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["home_content"].replace_one({}, content.dict(), upsert=True)
    return {"message": "Home content updated successfully"}

@app.put("/api/admin/content/about")
async def update_about_content(content: AboutPageContentModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["about_content"].replace_one({}, content.dict(), upsert=True)
    return {"message": "About content updated successfully"}

@app.put("/api/admin/content/contact")
async def update_contact_content(content: ContactPageContentModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["contact_content"].replace_one({}, content.dict(), upsert=True)
    return {"message": "Contact content updated successfully"}

@app.put("/api/admin/content/journal")
async def update_journal_content(content: JournalPageContentModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["journal_content"].replace_one({}, content.dict(), upsert=True)
    return {"message": "Journal content updated successfully"}

@app.post("/api/admin/posts")
async def create_post(post: PostModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    if await db["posts"].find_one({"slug": post.slug}):
        raise HTTPException(status_code=400, detail="Post with this slug already exists")
    await db["posts"].insert_one(post.dict())
    return {"message": "Post created successfully"}

@app.put("/api/admin/posts/{slug}")
async def update_post(slug: str, post: PostModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    result = await db["posts"].replace_one({"slug": slug}, post.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post updated successfully"}

@app.delete("/api/admin/posts/{slug}")
async def delete_post(slug: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    result = await db["posts"].delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

@app.post("/api/admin/policies")
async def create_policy(policy: PolicyModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    if await db["policies"].find_one({"slug": policy.slug}):
        raise HTTPException(status_code=400, detail="Policy with this slug already exists")
    await db["policies"].insert_one(policy.dict())
    return {"message": "Policy created successfully"}

@app.put("/api/admin/policies/{slug}")
async def update_policy(slug: str, policy: PolicyModel, db=Depends(get_database), current_user=Depends(get_current_user)):
    result = await db["policies"].replace_one({"slug": slug}, policy.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy updated successfully"}

@app.delete("/api/admin/policies/{slug}")
async def delete_policy(slug: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    result = await db["policies"].delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy deleted successfully"}

@app.get("/api/admin/contacts")
async def get_contacts(db=Depends(get_database), current_user=Depends(get_current_user)):
    cursor = db["contact_messages"].find({}).sort("createdAt", -1)
    contacts = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        contacts.append(doc)
    return contacts

from bson import ObjectId

@app.delete("/api/admin/contacts/{id}")
async def delete_contact(id: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    try:
        result = await db["contact_messages"].delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        return {"message": "Inquiry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ID: {str(e)}")

@app.get("/api/admin/customers")
async def get_customers(db=Depends(get_database), current_user=Depends(get_current_user)):
    cursor = db["users"].find({})
    customers = []
    async for doc in cursor:
        # Extract registration date from MongoDB ObjectId
        doc["createdAt"] = doc["_id"].generation_time.isoformat()
        doc["_id"] = str(doc["_id"])
        if "password_hash" in doc:
            del doc["password_hash"]
        customers.append(doc)
    return customers

@app.delete("/api/admin/customers/{id}")
async def delete_customer(id: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    try:
        result = await db["users"].delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"message": "Customer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ID: {str(e)}")

@app.post("/api/admin/brand-values")
async def add_brand_value(data: dict, db=Depends(get_database), current_user=Depends(get_current_user)):
    if await db["brand_values"].find_one({"title": data["title"]}):
        raise HTTPException(status_code=400, detail="Brand value already exists")
    await db["brand_values"].insert_one(data)
    return {"message": "Brand value added"}

@app.put("/api/admin/brand-values/{title}")
async def update_brand_value(title: str, data: dict, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["brand_values"].update_one({"title": title}, {"$set": data})
    return {"message": "Brand value updated"}

@app.delete("/api/admin/brand-values/{title}")
async def delete_brand_value(title: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["brand_values"].delete_one({"title": title})
    return {"message": "Brand value deleted"}

@app.post("/api/admin/milestones")
async def add_milestone(data: dict, db=Depends(get_database), current_user=Depends(get_current_user)):
    if await db["milestones"].find_one({"year": data["year"]}):
        raise HTTPException(status_code=400, detail="Milestone for this year already exists")
    await db["milestones"].insert_one(data)
    return {"message": "Milestone added"}

@app.put("/api/admin/milestones/{year}")
async def update_milestone(year: str, data: dict, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["milestones"].update_one({"year": year}, {"$set": data})
    return {"message": "Milestone updated"}

@app.delete("/api/admin/milestones/{year}")
async def delete_milestone(year: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["milestones"].delete_one({"year": year})
    return {"message": "Milestone deleted"}

@app.get("/api/content/login")
async def get_login_content(db=Depends(get_database)):
    content = await db["login_content"].find_one({}, {"_id": 0})
    if not content:
        content = LoginPageContentModel().dict()
        await db["login_content"].insert_one(content)
        content = await db["login_content"].find_one({}, {"_id": 0})
    return content

@app.get("/api/content/home")
async def get_home_content(db=Depends(get_database)):
    content = await db["home_content"].find_one({}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Home content not found")
    return content

@app.get("/api/content/about")
async def get_about_content(db=Depends(get_database)):
    content = await db["about_content"].find_one({}, {"_id": 0})
    if not content:
        content = AboutPageContentModel().dict()
        await db["about_content"].insert_one(content)
        content = await db["about_content"].find_one({}, {"_id": 0})
    return content

@app.get("/api/content/contact")
async def get_contact_content(db=Depends(get_database)):
    content = await db["contact_content"].find_one({}, {"_id": 0})
    if not content:
        content = ContactPageContentModel().dict()
        await db["contact_content"].insert_one(content)
        content = await db["contact_content"].find_one({}, {"_id": 0})
    else:
        # Repopulate default fields (like socials) if they expand in schema
        content = ContactPageContentModel(**content).dict()
    return content

@app.get("/api/content/journal")
async def get_journal_content(db=Depends(get_database)):
    content = await db["journal_content"].find_one({}, {"_id": 0})
    if not content:
        content = JournalPageContentModel().dict()
        await db["journal_content"].insert_one(content)
        content = await db["journal_content"].find_one({}, {"_id": 0})
    return content

@app.get("/api/settings/integrations")
async def get_integrations_settings(db=Depends(get_database)):
    content = await db["integrations"].find_one({}, {"_id": 0})
    if not content:
        content = IntegrationsModel().model_dump()
        await db["integrations"].insert_one(content)
        content = await db["integrations"].find_one({}, {"_id": 0})
    dump = IntegrationsModel(**content).model_dump()
    dump["delhivery_api_token"] = "***" if dump.get("delhivery_api_token") else ""
    dump["razorpay_key_secret"] = "***" if dump.get("razorpay_key_secret") else ""
    return dump

@app.get("/api/posts")
async def get_posts(db=Depends(get_database)):
    return await db["posts"].find({}, {"_id": 0}).to_list(None)

@app.get("/api/posts/{slug}")
async def get_post(slug: str, db=Depends(get_database)):
    post = await db["posts"].find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# -------------------------------------------------------------------
# Auth & User Endpoints
# -------------------------------------------------------------------





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

@app.post("/api/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db=Depends(get_database)):
    user = await db["users"].find_one({"email": req.email})
    if not user:
        # Return success even if not found to prevent email enumeration
        return {"success": True, "message": "If that email exists, an OTP has been sent."}
    
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    await db["otps"].replace_one(
        {"email": req.email},
        {"email": req.email, "otp": otp, "expires_at": expires_at},
        upsert=True
    )
    
    subject = "Your Password Reset OTP"
    body = f"""Hi there,

We received a request to reset your password. Here is your One-Time Password (OTP):

<div style="text-align: center; margin: 30px 0;">
    <span style="background-color: #f3f4f6; color: #111827; padding: 12px 24px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px;">{otp}</span>
</div>

This OTP is valid for 10 minutes.
If you did not request this, please ignore this email.

Stay healthy,
The Sonrup Team"""
    
    background_tasks.add_task(send_custom_email, req.email, subject, body)
    return {"success": True, "message": "If that email exists, an OTP has been sent."}

@app.post("/api/auth/verify-otp")
async def verify_otp(req: VerifyOtpRequest, db=Depends(get_database)):
    otp_doc = await db["otps"].find_one({"email": req.email})
    if not otp_doc or otp_doc["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    if datetime.utcnow() > otp_doc["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    return {"success": True, "message": "OTP verified successfully"}

@app.post("/api/auth/reset-password")
async def reset_password(req: ResetPasswordOtpRequest, db=Depends(get_database)):
    otp_doc = await db["otps"].find_one({"email": req.email})
    if not otp_doc or otp_doc["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    if datetime.utcnow() > otp_doc["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    # Update password
    await db["users"].update_one(
        {"email": req.email},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    
    # Delete OTP to prevent reuse
    await db["otps"].delete_one({"email": req.email})
    
    return {"success": True, "message": "Password reset successfully"}

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

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    # Check if user is admin (assuming role field, defaulting to non-admin if missing)
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    upload_dir = os.path.join(os.getcwd(), "backend", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    api_url = os.getenv("VITE_API_URL", "")
    return {"url": f"{api_url}/uploads/{unique_filename}"}

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

from pydantic import BaseModel

class RazorpayCreateOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"

@app.post("/api/razorpay/create-order")
async def create_razorpay_order(data: RazorpayCreateOrderRequest, db=Depends(get_database)):
    integrations = await db["integrations"].find_one({}) or {}
    key_id = integrations.get("razorpay_key_id")
    key_secret = integrations.get("razorpay_key_secret")

    if not key_id or not key_secret:
        raise HTTPException(status_code=400, detail="Razorpay credentials not configured")

    client = razorpay.Client(auth=(key_id, key_secret))
    try:
        order = client.order.create({
            "amount": int(data.amount * 100), # Amount in paise
            "currency": data.currency,
            "payment_capture": "1"
        })
        return {"order_id": order["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.post("/api/razorpay/verify")
async def verify_razorpay_payment(data: RazorpayVerifyRequest, db=Depends(get_database)):
    integrations = await db["integrations"].find_one({}) or {}
    key_id = integrations.get("razorpay_key_id")
    key_secret = integrations.get("razorpay_key_secret")

    if not key_id or not key_secret:
        raise HTTPException(status_code=400, detail="Razorpay credentials not configured")

    client = razorpay.Client(auth=(key_id, key_secret))
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid payment signature")


# -------------------------------------------------------------------
# Newsletter Endpoint
# -------------------------------------------------------------------

def send_welcome_email(email_address: str):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    frontend_url = os.environ.get("FRONTEND_URL", "")
    
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

def send_custom_email(email_address: str, subject: str, body_text: str):
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    frontend_url = os.environ.get("FRONTEND_URL", "")

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = email_address
    
    html_content = f"""
    <html>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6; padding: 20px; margin: 0; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #eaeaea; overflow: hidden;">
            <div style="padding: 25px 30px; text-align: center; background-color: #1f1d1a;">
                <img src="{frontend_url}/logo.png" alt="SONRUP" style="height: 40px; width: auto; color: #eab308; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;" />
            </div>
            <div style="padding: 30px; font-size: 16px; white-space: pre-wrap;">
{body_text}
            </div>
            <div style="padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eaeaea; background-color: #fafafa;">
                &copy; {datetime.now().year} Sonrup. All rights reserved.
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
        print(f"Failed to send custom email to {email_address}: {e}")

@app.get("/api/admin/newsletter")
async def get_newsletter_subscribers(db=Depends(get_database), current_user=Depends(get_current_user)):
    cursor = db["newsletter"].find({}, {"_id": 0}).sort("_id", -1)
    return await cursor.to_list(length=1000)

@app.delete("/api/admin/newsletter/{email}")
async def delete_newsletter_subscriber(email: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    await db["newsletter"].delete_one({"email": email})
    return {"message": "Subscriber removed successfully"}

@app.post("/api/admin/newsletter/broadcast")
async def broadcast_email(payload: BroadcastPayload, background_tasks: BackgroundTasks, db=Depends(get_database), current_user=Depends(get_current_user)):
    emails = []
    if payload.target == "subscribers":
        cursor = db["newsletter"].find({}, {"_id": 0, "email": 1})
        emails = [doc["email"] for doc in await cursor.to_list(length=1000)]
    elif payload.target == "inquiries":
        cursor = db["contact_messages"].find({}, {"_id": 0, "email": 1})
        emails = list(set([doc["email"] for doc in await cursor.to_list(length=1000)]))
    
    if not emails:
        raise HTTPException(status_code=400, detail="No recipients found for this target.")
    
    for email in emails:
        background_tasks.add_task(send_custom_email, email, payload.subject, payload.message)
        
    return {"message": f"Broadcast started for {len(emails)} recipients."}

# Serve uploaded files statically
os.makedirs("backend/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

from backend.admin import router as admin_router
app.include_router(admin_router)

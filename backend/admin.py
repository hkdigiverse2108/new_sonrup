from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from backend.database import get_database
from backend.models import ProductModel, ReviewModel, FaqModel, HomePageContentModel, FlavourModel, ProductReviewModel
from backend.main import get_current_user
from typing import Any, Dict
import os
import uuid
import shutil

router = APIRouter(prefix="/api/admin", tags=["admin"])

def require_admin(current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# ---------------------------------------------------------
# Uploads
# ---------------------------------------------------------
@router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(require_admin)):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join("backend/uploads", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"http://localhost:8000/uploads/{filename}"}

# ---------------------------------------------------------
# Products CRUD
# ---------------------------------------------------------
@router.post("/products")
async def create_product(product: ProductModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["products"].insert_one(product.model_dump())
    return {"success": True}

@router.put("/products/{slug}")
async def update_product(slug: str, product: ProductModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["products"].replace_one({"slug": slug}, product.model_dump())
    return {"success": True}

@router.delete("/products/{slug}")
async def delete_product(slug: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["products"].delete_one({"slug": slug})
    return {"success": True}

# ---------------------------------------------------------
# Reviews CRUD
# ---------------------------------------------------------
@router.post("/reviews")
async def create_review(review: ReviewModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["reviews"].insert_one(review.model_dump())
    return {"success": True}

@router.put("/reviews/{name}")
async def update_review(name: str, review: ReviewModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["reviews"].replace_one({"name": name}, review.model_dump())
    return {"success": True}

@router.delete("/reviews/{name}")
async def delete_review(name: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["reviews"].delete_one({"name": name})
    return {"success": True}

# ---------------------------------------------------------
# Product Reviews CRUD
# ---------------------------------------------------------
from bson import ObjectId

@router.post("/product-reviews")
async def create_product_review(review: ProductReviewModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["product_reviews"].insert_one(review.model_dump())
    return {"success": True}

@router.put("/product-reviews/{id}")
async def update_product_review(id: str, review: ProductReviewModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["product_reviews"].replace_one({"_id": ObjectId(id)}, review.model_dump())
    return {"success": True}

@router.delete("/product-reviews/{id}")
async def delete_product_review(id: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["product_reviews"].delete_one({"_id": ObjectId(id)})
    return {"success": True}


# ---------------------------------------------------------
# FAQs CRUD
# ---------------------------------------------------------
@router.post("/faqs")
async def create_faq(faq: FaqModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["faqs"].insert_one(faq.model_dump())
    return {"success": True}

@router.put("/faqs/{q}")
async def update_faq(q: str, faq: FaqModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["faqs"].replace_one({"q": q}, faq.model_dump())
    return {"success": True}

@router.delete("/faqs/{q}")
async def delete_faq(q: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["faqs"].delete_one({"q": q})
    return {"success": True}

# ---------------------------------------------------------
# Orders Management
# ---------------------------------------------------------
@router.get("/orders")
async def get_all_orders(admin=Depends(require_admin), db=Depends(get_database)):
    cursor = db["orders"].find({}, {"_id": 0}).sort("date", -1)
    orders = await cursor.to_list(length=1000)
    return orders

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: Dict[str, str], admin=Depends(require_admin), db=Depends(get_database)):
    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Missing status")
    await db["orders"].update_one({"id": order_id}, {"$set": {"status": status}})
    return {"success": True}

# ---------------------------------------------------------
# Home Page Content
# ---------------------------------------------------------
@router.put("/content/home")
async def update_home_content(content: HomePageContentModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["home_content"].replace_one({}, content.model_dump(), upsert=True)
    return {"success": True}
    return {"success": True}

# ---------------------------------------------------------
# Flavours CRUD
# ---------------------------------------------------------
@router.post("/flavours")
async def create_flavour(flavour: FlavourModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["flavours"].insert_one(flavour.model_dump())
    return {"success": True}

@router.put("/flavours/{token}")
async def update_flavour(token: str, flavour: FlavourModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["flavours"].replace_one({"token": token}, flavour.model_dump())
    return {"success": True}

@router.delete("/flavours/{token}")
async def delete_flavour(token: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["flavours"].delete_one({"token": token})
    return {"success": True}

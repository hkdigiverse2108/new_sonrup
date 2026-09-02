from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from backend.database import get_database
from backend.models import ProductModel, ReviewModel, FaqModel, HomePageContentModel, FlavourModel, ProductReviewModel, IntegrationsModel, LoginPageContentModel, AboutPageContentModel, JournalPageContentModel, PostModel
from backend.main import get_current_user
from typing import Any, Dict
import os
import uuid
import shutil
import random
import httpx
from datetime import datetime, timedelta

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
    ext = file.filename.split(".")[-1].lower()
    raw_bytes = await file.read()
    
    unique_id = uuid.uuid4().hex
    os.makedirs("backend/uploads", exist_ok=True)
    
    try:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(raw_bytes))
        if im.width > 1920 or im.height > 1920:
            im.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
            
        filename = f"{unique_id}.webp"
        filepath = os.path.join("backend/uploads", filename)
        
        if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
            im.save(filepath, "WEBP", quality=85, optimize=True)
        else:
            im = im.convert("RGB")
            im.save(filepath, "WEBP", quality=85, optimize=True)
    except Exception:
        filename = f"{unique_id}.{ext}"
        filepath = os.path.join("backend/uploads", filename)
        with open(filepath, "wb") as buffer:
            buffer.write(raw_bytes)
            
    api_url = os.getenv("VITE_API_URL", "")
    return {"url": f"{api_url}/uploads/{filename}"}

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
    cursor = db["orders"].find({}, {"_id": 0}).sort("_id", -1)
    orders = await cursor.to_list(length=1000)
    return orders

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: Dict[str, str], admin=Depends(require_admin), db=Depends(get_database)):
    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Missing status")
        
    order = await db["orders"].find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if status == "Cancelled" and order.get("delhivery_awb"):
        awb = order.get("delhivery_awb")
        integrations = await db["integrations"].find_one({}) or {}
        token = integrations.get("delhivery_api_token")
        
        if token:
            delhivery_payload = {
                "waybill": awb,
                "cancellation": "true"
            }
            headers = {
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            }
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        "https://track.delhivery.com/api/p/edit", 
                        json=delhivery_payload, 
                        headers=headers,
                        timeout=15.0
                    )
            except Exception as e:
                print("Failed to cancel on Delhivery during status update:", str(e))

    await db["orders"].update_one({"id": order_id}, {"$set": {"status": status}})
    return {"success": True}

@router.post("/orders/{order_id}/ship")
async def ship_order(order_id: str, admin=Depends(require_admin), db=Depends(get_database)):
    order = await db["orders"].find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    integrations = await db["integrations"].find_one({}) or {}
    token = integrations.get("delhivery_api_token")
    warehouse = integrations.get("delhivery_warehouse_name")
    
    if not token or not warehouse:
        raise HTTPException(status_code=400, detail="Delhivery credentials not configured in Integrations settings")

    is_cod = order.get("payment_method") == "cod"
    payment_mode = "COD" if is_cod else "Pre-paid"
    cod_amount = order.get("total", 0) if is_cod else 0

    resolved_items = order.get("items", [])

    # Assuming default 500g for gummy tubes
    payload = {
        "format": "json",
        "data": {
            "shipments": [
                {
                    "name": order.get("customer_name", "Customer"),
                    "add": order.get("shipping_address", {}).get("line1") or order.get("shipping_address", {}).get("address") or "",
                    "pin": order.get("shipping_address", {}).get("pincode", ""),
                    "city": order.get("shipping_address", {}).get("city", ""),
                    "state": order.get("shipping_address", {}).get("state", ""),
                    "country": "India",
                    "phone": order.get("customer_phone", ""),
                    "order": order.get("id"),
                    "payment_mode": payment_mode,
                    "return_add": "",
                    "return_pin": "",
                    "return_city": "",
                    "return_state": "",
                    "return_country": "",
                    "products_desc": ", ".join(f"{item.get('name') or 'Gummy Tube'} (x{item.get('qty') or 1})" for item in resolved_items)[:240] or "SonRup Gummy Tubes",
                    "hsn_code": "",
                    "cod_amount": cod_amount,
                    "order_date": datetime.now().isoformat(),
                    "total_amount": order.get("total", 0),
                    "seller_add": "",
                    "seller_name": "SonRup",
                    "seller_inv": "",
                    "quantity": sum(item.get("qty") or item.get("quantity") or 1 for item in resolved_items),
                    "weight": 500
                }
            ],
            "pickup_location": {
                "name": warehouse
            }
        }
    }

    headers = {
        "Authorization": f"Token {token}"
    }

    try:
        async with httpx.AsyncClient() as client:
            import json
            form_data = {
                "format": "json",
                "data": json.dumps(payload["data"])
            }
            
            response = await client.post(
                "https://track.delhivery.com/api/cmu/create.json", 
                data=form_data, 
                headers=headers,
                timeout=15.0
            )
            response.raise_for_status()
            res_data = response.json()
            
            # Check for Delhivery specific errors
            if not res_data.get("success"):
                if res_data.get("packages") and res_data["packages"][0].get("waybill"):
                    # Partially succeeded, we have a waybill
                    pass
                else:
                    # Try to extract a meaningful error message from remarks
                    error_msg = res_data.get("rmk") or res_data.get("error") or "Unknown error"
                    if res_data.get("packages") and len(res_data["packages"]) > 0:
                        remarks = res_data["packages"][0].get("remarks")
                        if remarks and len(remarks) > 0:
                            error_msg = remarks[0]
                    raise HTTPException(status_code=400, detail=f"Delhivery Error: {error_msg}")
            
            # The structure of successful response usually contains 'packages' list with 'waybill'
            packages = res_data.get("packages", [])
            if not packages:
                # If they already returned a waybill in another field
                if "waybill" in res_data:
                    waybill = res_data["waybill"]
                else:
                    raise Exception(f"No packages returned: {res_data}")
            else:
                waybill = packages[0].get("waybill")
                if not waybill:
                    raise Exception(f"Failed to generate AWB: {res_data}")
            
            await db["orders"].update_one(
                {"id": order_id},
                {"$set": {"delhivery_awb": waybill, "delhivery_status": "Manifested", "status": "Shipped"}}
            )
            return {"success": True, "awb": waybill}
    except HTTPException:
        raise
    except httpx.HTTPStatusError as e:
        print("[DELHIVERY HTTP ERROR]", e.response.text)
        raise HTTPException(status_code=400, detail=f"Delhivery API Error: {e.response.text}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create shipment: {str(e)}")

@router.post("/orders/{order_id}/pickup")
async def pickup_order(order_id: str, admin=Depends(require_admin), db=Depends(get_database)):
    integrations = await db["integrations"].find_one({}) or {}
    token = integrations.get("delhivery_api_token")
    warehouse = integrations.get("delhivery_warehouse_name")
    
    if not token or not warehouse:
        raise HTTPException(status_code=400, detail="Delhivery credentials not configured")

    # Pickup date is tomorrow
    pickup_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    payload = {
        "pickup_time": "15:00:00",
        "pickup_date": pickup_date,
        "pickup_location": warehouse,
        "expected_package_count": "1"
    }

    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://track.delhivery.com/fm/request/pb/generate", 
                json=payload, 
                headers=headers,
                timeout=15.0
            )
            
            res_data = response.json() if response.text else {}
            
            if response.status_code >= 400:
                error_msg = res_data.get("error") or res_data.get("message") or response.text
                raise HTTPException(status_code=400, detail=f"Delhivery Error: {error_msg}")
                
            if res_data.get("error"):
                raise HTTPException(status_code=400, detail=f"Delhivery Error: {res_data['error']}")
                
            await db["orders"].update_one(
                {"id": order_id},
                {"$set": {"delhivery_status": "Pickup Scheduled"}}
            )
            return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to schedule pickup: {str(e)}")

@router.get("/orders/{order_id}/label")
async def get_shipping_label(order_id: str, admin=Depends(require_admin), db=Depends(get_database)):
    order = await db["orders"].find_one({"id": order_id})
    if not order or not order.get("delhivery_awb"):
        raise HTTPException(status_code=400, detail="Order does not have a valid Delhivery AWB")

    integrations = await db["integrations"].find_one({}) or {}
    token = integrations.get("delhivery_api_token")
    if not token:
        raise HTTPException(status_code=400, detail="Delhivery credentials not configured")

    awb = order.get("delhivery_awb")
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://track.delhivery.com/api/p/packing_slip?wbns={awb}",
                headers=headers,
                timeout=15.0
            )
            res_data = response.json() if response.text else {}
            
            if response.status_code >= 400:
                error_msg = res_data.get("error") or res_data.get("message") or response.text
                raise HTTPException(status_code=400, detail=f"Delhivery Error: {error_msg}")

            packages = res_data.get("packages", [])
            if not packages:
                raise HTTPException(status_code=400, detail="Failed to fetch label details from Delhivery")
            
            return {"success": True, "label_data": packages[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch label: {str(e)}")

@router.post("/orders/{order_id}/cancel-shipment")
async def cancel_shipment(order_id: str, admin=Depends(require_admin), db=Depends(get_database)):
    order = await db["orders"].find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    awb = order.get("delhivery_awb")
    if awb:
        integrations = await db["integrations"].find_one({}) or {}
        token = integrations.get("delhivery_api_token")
        
        if token:
            payload = {
                "waybill": awb,
                "cancellation": "true"
            }
            headers = {
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            }
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://track.delhivery.com/api/p/edit", 
                        json=payload, 
                        headers=headers,
                        timeout=15.0
                    )
                    # Even if it errors, we proceed to clean up locally, but we could log it
            except Exception as e:
                print("Failed to cancel on Delhivery:", str(e))

    await db["orders"].update_one(
        {"id": order_id},
        {"$set": {"delhivery_awb": None, "delhivery_status": None, "status": "Processing"}}
    )
    return {"success": True}

@router.delete("/orders/{order_id}")
async def delete_order(order_id: str, admin=Depends(require_admin), db=Depends(get_database)):
    order = await db["orders"].find_one({"id": order_id})
    if order and order.get("delhivery_awb"):
        # Cancel the shipment on Delhivery if it exists
        awb = order.get("delhivery_awb")
        integrations = await db["integrations"].find_one({}) or {}
        token = integrations.get("delhivery_api_token")
        if token:
            payload = {
                "waybill": awb,
                "cancellation": "true"
            }
            headers = {
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            }
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        "https://track.delhivery.com/api/p/edit", 
                        json=payload, 
                        headers=headers,
                        timeout=15.0
                    )
            except Exception:
                pass

    await db["orders"].delete_one({"id": order_id})
    return {"success": True}

# ---------------------------------------------------------
# Login Page Content
# ---------------------------------------------------------
@router.put("/content/login")
async def update_login_content(content: LoginPageContentModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["login_content"].replace_one({}, content.model_dump(), upsert=True)
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

# ---------------------------------------------------------
# Integrations Settings
# ---------------------------------------------------------
@router.get("/settings/integrations")
async def get_admin_integrations_settings(admin=Depends(require_admin), db=Depends(get_database)):
    content = await db["integrations"].find_one({}, {"_id": 0})
    if not content:
        from backend.models import IntegrationsModel
        content = IntegrationsModel().model_dump()
    return content

@router.put("/settings/integrations")
async def update_integrations_settings(content: IntegrationsModel, admin=Depends(require_admin), db=Depends(get_database)):
    existing = await db["integrations"].find_one({}) or {}
    new_data = content.model_dump()
    if new_data.get("delhivery_api_token") == "***":
        new_data["delhivery_api_token"] = existing.get("delhivery_api_token", "")
    if new_data.get("razorpay_key_secret") == "***":
        new_data["razorpay_key_secret"] = existing.get("razorpay_key_secret", "")
    await db["integrations"].replace_one({}, new_data, upsert=True)
    return {"success": True}

# ---------------------------------------------------------
# About & Journal Page Content
# ---------------------------------------------------------
@router.put("/content/about")
async def update_about_content(content: AboutPageContentModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["about_content"].replace_one({}, content.model_dump(), upsert=True)
    return {"success": True}

@router.put("/content/journal")
async def update_journal_content(content: JournalPageContentModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["journal_content"].replace_one({}, content.model_dump(), upsert=True)
    return {"success": True}

@router.post("/posts")
async def create_post(post: PostModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["posts"].insert_one(post.model_dump())
    return {"success": True}

@router.put("/posts/{slug}")
async def update_post(slug: str, post: PostModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["posts"].replace_one({"slug": slug}, post.model_dump())
    return {"success": True}

@router.delete("/posts/{slug}")
async def delete_post(slug: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["posts"].delete_one({"slug": slug})
    return {"success": True}

from backend.models import BrandValueModel, MilestoneModel

# ---------------------------------------------------------
# Brand Values
# ---------------------------------------------------------
@router.post("/brand-values")
async def create_brand_value(val: BrandValueModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["brand_values"].insert_one(val.model_dump())
    return {"success": True}

@router.put("/brand-values/{title}")
async def update_brand_value(title: str, val: BrandValueModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["brand_values"].replace_one({"title": title}, val.model_dump())
    return {"success": True}

@router.delete("/brand-values/{title}")
async def delete_brand_value(title: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["brand_values"].delete_one({"title": title})
    return {"success": True}

# ---------------------------------------------------------
# Milestones
# ---------------------------------------------------------
@router.post("/milestones")
async def create_milestone(val: MilestoneModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["milestones"].insert_one(val.model_dump())
    return {"success": True}

@router.put("/milestones/{year}")
async def update_milestone(year: str, val: MilestoneModel, admin=Depends(require_admin), db=Depends(get_database)):
    await db["milestones"].replace_one({"year": year}, val.model_dump())
    return {"success": True}

@router.delete("/milestones/{year}")
async def delete_milestone(year: str, admin=Depends(require_admin), db=Depends(get_database)):
    await db["milestones"].delete_one({"year": year})
    return {"success": True}

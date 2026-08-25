from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Ingredient(BaseModel):
    name: str
    note: str

class Nutrition(BaseModel):
    label: str
    value: str

class ProductModel(BaseModel):
    slug: str
    name: str
    tagline: str
    description: str
    image: str
    price: float
    mrp: float
    rating: float
    reviews: int
    flavour: str
    flavourToken: str
    categories: List[str]
    benefits: List[str]
    goals: List[str]
    badges: List[str]
    ingredients: List[Ingredient]
    nutrition: List[Nutrition]
    howToUse: str
    storage: str
    count: str

class ReviewModel(BaseModel):
    name: str
    city: str
    rating: int
    text: str
    product: str

class FaqModel(BaseModel):
    category: str
    q: str
    a: str

class PostModel(BaseModel):
    slug: str
    title: str
    category: str
    date: str
    read: str
    excerpt: str
    accent: str
    body: List[str]

class PolicySection(BaseModel):
    heading: str
    body: List[str]

class PolicyModel(BaseModel):
    slug: str
    title: str
    updated: str
    intro: str
    sections: List[PolicySection]

class FlavourModel(BaseModel):
    name: str
    token: str
    note: str

class GoalModel(BaseModel):
    name: str

class BrandValueModel(BaseModel):
    title: str
    body: str

class MilestoneModel(BaseModel):
    year: str
    text: str

# -------------------------------------
# User Authentication & Profiles
# -------------------------------------

class AddressModel(BaseModel):
    id: str
    label: str
    name: str
    line1: str
    city: str
    state: str
    pincode: str
    phone: str
    isDefault: Optional[bool] = False

class OrderItemModel(BaseModel):
    slug: str
    name: str
    image: str
    price: float
    count: str
    qty: int

class OrderModel(BaseModel):
    id: str
    date: str
    status: str
    total: float
    items: List[OrderItemModel]

class UserModel(BaseModel):
    email: str
    name: str
    password_hash: str
    phone: Optional[str] = ""
    addresses: List[AddressModel] = []
    orders: List[OrderModel] = []

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class NewsletterSubscribe(BaseModel):
    email: str

# -------------------------------------
# CMS Content
# -------------------------------------
class StatModel(BaseModel):
    k: str
    v: str

class FeatureModel(BaseModel):
    title: str
    desc: str

class HeroContent(BaseModel):
    rotate: List[str]
    stats: List[StatModel]

class WhyContent(BaseModel):
    title: str
    sub: str
    features: List[FeatureModel]

class IngredientStoryContent(BaseModel):
    eyebrow: str
    title: str
    sub: str

class HomePageContentModel(BaseModel):
    hero: HeroContent
    trust_strip: List[str]
    why: WhyContent
    ingredient_story: IngredientStoryContent

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Ingredient(BaseModel):
    name: str
    note: str

class Nutrition(BaseModel):
    label: str
    value: str

class AccordionItem(BaseModel):
    title: str
    content: str

class TrustBadge(BaseModel):
    icon: str
    text: str

class IntegrationsModel(BaseModel):
    free_shipping_amount: float = 499.0
    max_filter_price: float = 1500.0
    delhivery_api_token: Optional[str] = ""
    delhivery_warehouse_name: str = ""
    razorpay_key_id: Optional[str] = ""
    razorpay_key_secret: Optional[str] = ""
    razorpay_mode: str = "test"
    announcement_bar_items: List[str] = [
        "FREE SHIPPING ON ORDERS ABOVE ₹499",
        "60 GUMMIES PER TUBE",
        "MADE WITH REAL FRUIT FLAVOURS",
        "VEGETARIAN · PECTIN BASED"
    ]

class ProductModel(BaseModel):
    slug: str
    name: str
    tagline: Optional[str] = ""
    description: Optional[str] = ""
    image: Optional[str] = ""
    gallery: Optional[List[str]] = []
    related_products: Optional[List[str]] = []
    frequently_bought_together: Optional[List[str]] = []
    bundle_price: Optional[float] = None
    price: float
    mrp: float
    rating: Optional[float] = 5.0
    reviews: Optional[int] = 0
    flavour: Optional[str] = ""
    flavourToken: Optional[str] = ""
    categories: Optional[List[str]] = []
    benefits: Optional[List[str]] = []
    goals: Optional[List[str]] = []
    badges: Optional[List[str]] = []
    ingredients: Optional[List[Ingredient]] = []
    nutrition: Optional[List[Nutrition]] = []
    howToUse: Optional[str] = ""
    storage: Optional[str] = ""
    count: Optional[str] = ""
    format: Optional[str] = "Pectin Gummy"
    shipping_info: Optional[str] = "Dispatched within 24 working hours. Metro cities in 2-3 days, rest of India in 4-6 days. Free above ₹499."
    returns_info: Optional[str] = "Unopened tubes can be returned within 7 days of delivery. Refunds are processed within 5-7 working days."
    accordions: Optional[List[AccordionItem]] = []
    trust_badges: Optional[List[TrustBadge]] = []

class ReviewModel(BaseModel):
    name: str
    city: str
    rating: int
    text: str
    product: str

class ProductReviewModel(BaseModel):
    product_slug: str
    name: str
    city: str
    rating: int
    text: str

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
    image: Optional[str] = ""

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

class ShippingAddress(BaseModel):
    line1: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None

class OrderModel(BaseModel):
    id: str
    date: str
    status: str
    total: float
    items: List[OrderItemModel]
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: ShippingAddress
    payment_method: str
    delhivery_awb: Optional[str] = None
    delhivery_status: Optional[str] = None

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

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordOtpRequest(BaseModel):
    email: str
    otp: str
    new_password: str

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
    desc: Optional[str] = ""
    text: Optional[str] = ""
    icon: Optional[str] = ""

class HeroContent(BaseModel):
    rotate: List[str] = []
    stats: List[StatModel] = []
    eyebrow: Optional[str] = "Est. 2023 · Made in India"
    headline_line1: Optional[str] = "A daily ritual"
    headline_line2: Optional[str] = "worth savouring"
    headline_for_your: Optional[str] = "for your"
    subtext: Optional[str] = "Chef-crafted gummies with real fruit flavour and actives listed to the milligram."
    cta1_text: Optional[str] = "Shop the range"
    cta1_href: Optional[str] = "/shop"
    cta2_text: Optional[str] = "Taste the flavours"
    cta2_href: Optional[str] = "#flavours"
    badge1_label: Optional[str] = "Third-party tested"
    badge1_value: Optional[str] = "Every single batch"
    badge2_label: Optional[str] = "Pectin based"
    badge2_value: Optional[str] = "100% vegetarian"
    main_image: Optional[str] = ""
    left_image: Optional[str] = ""
    right_image: Optional[str] = ""

class WhyContent(BaseModel):
    eyebrow: Optional[str] = "WHY OUR GUMMIES"
    title: str
    sub: str
    image: Optional[str] = ""
    stat_value: Optional[str] = "98%"
    stat_text: Optional[str] = "of customers say they'd never go back to tablets."
    features: List[FeatureModel]

class IngredientStoryContent(BaseModel):
    eyebrow: Optional[str] = "INGREDIENT STORY"
    title: str
    sub: str
    image: Optional[str] = ""
    ingredients: List[Dict[str, str]] = []

class FlavourModel(BaseModel):
    name: str
    token: str
    note: str
    image: Optional[str] = ""

class FlavourSectionContent(BaseModel):
    eyebrow: str
    title_black: str
    title_gold: str

class BrandStoryContent(BaseModel):
    eyebrow: Optional[str] = "Our story"
    title_black1: str
    title_gold: str
    title_black2: str
    paragraph1: str
    paragraph2: str
    stats: List[Dict[str, str]] = []
    cta_text: Optional[str] = "Read our story"
    cta_link: Optional[str] = "/about"
    main_image: Optional[str] = ""
    floating_image: Optional[str] = ""

class ReviewsSectionContent(BaseModel):
    eyebrow: Optional[str] = "Reviews"
    title: Optional[str] = "Loved by 120,000+ mornings"

class SocialSectionContent(BaseModel):
    eyebrow: Optional[str] = "@sonrup"
    title: Optional[str] = "Join the gummy club"
    cta_text: Optional[str] = "Follow us"
    cta_link: Optional[str] = "#"
    images: List[str] = []
    image_links: List[str] = []

class FaqHomeSectionContent(BaseModel):
    eyebrow: Optional[str] = "FAQ"
    title: Optional[str] = "Good questions, straight answers"
    cta_text: Optional[str] = "All FAQs"

class FaqPageHeaderContent(BaseModel):
    eyebrow: Optional[str] = "Help centre"
    title_black: Optional[str] = "Questions, "
    title_gold: Optional[str] = "answered."
    sub: Optional[str] = "Ingredients, dosage, delivery and returns — if it isn't here, our team replies within one working day."

class FaqSettingsContent(BaseModel):
    home_section: FaqHomeSectionContent = FaqHomeSectionContent()
    page_header: FaqPageHeaderContent = FaqPageHeaderContent()
    categories: List[str] = ["PRODUCTS", "INGREDIENTS", "SHIPPING", "RETURNS", "PAYMENTS", "ORDERS"]

class FinalCtaContent(BaseModel):
    title_white: Optional[str] = "Ready to make your day a little "
    title_gold: Optional[str] = "sweeter?"
    button_1_text: Optional[str] = "Shop all gummies"
    button_1_link: Optional[str] = "/shop"
    button_2_text: Optional[str] = "Best sellers"
    button_2_link: Optional[str] = "/shop?sort=bestsellers"
    image_left: Optional[str] = ""
    image_right: Optional[str] = ""

class HomePageContentModel(BaseModel):
    hero: HeroContent
    trust_strip: List[dict] = []
    flavour_section: Optional[FlavourSectionContent] = None
    why: Optional[WhyContent] = None
    ingredient_story: Optional[IngredientStoryContent] = None
    brand_story: Optional[BrandStoryContent] = None
    reviews_section: Optional[ReviewsSectionContent] = None
    social_section: Optional[SocialSectionContent] = None
    faq_settings: Optional[FaqSettingsContent] = None
    final_cta: Optional[FinalCtaContent] = None

class AboutPageHeroContent(BaseModel):
    eyebrow: Optional[str] = "Our story"
    title_black: Optional[str] = "Supplements you actually "
    title_gold: Optional[str] = "look forward to."
    sub: Optional[str] = "Sonrup began with a simple frustration: the best formulas in the world do nothing if the tub stays shut. So we built a brand around the one thing most supplements ignore — the experience of taking them."

class AboutWhyBenefit(BaseModel):
    icon: str
    t: str
    d: str

class AboutWhyContent(BaseModel):
    eyebrow: Optional[str] = "Why we exist"
    title: Optional[str] = "Flavour first. Science always."
    sub: Optional[str] = "Every batch has to pass two tests before it ships: does it work at a meaningful dose, and would you happily take it every morning for a year?"
    image: Optional[str] = ""
    benefits: List[AboutWhyBenefit] = [
        AboutWhyBenefit(icon="Leaf", t="Pectin based, 100% vegetarian", d="No gelatin, ever. Real fruit concentrates for flavour."),
        AboutWhyBenefit(icon="ShieldCheck", t="Tested every batch", d="Third-party lab checks for potency, purity and heavy metals."),
        AboutWhyBenefit(icon="Sparkles", t="Doses that matter", d="No fairy dusting — actives at levels backed by research.")
    ]

class AboutValuesHeaderContent(BaseModel):
    eyebrow: Optional[str] = "What we stand for"
    title: Optional[str] = "Our values"

class AboutJourneyHeaderContent(BaseModel):
    eyebrow: Optional[str] = "The journey"
    title: Optional[str] = "How we got here"

class AboutBottomCtaContent(BaseModel):
    title: Optional[str] = "Ready to make it a habit?"
    sub: Optional[str] = "Start with a best seller — free shipping on orders above ₹499."
    button_text: Optional[str] = "Shop the range"
    button_link: Optional[str] = "/shop"

class AboutPageContentModel(BaseModel):
    hero: AboutPageHeroContent = AboutPageHeroContent()
    why: AboutWhyContent = AboutWhyContent()
    values_header: AboutValuesHeaderContent = AboutValuesHeaderContent()
    journey_header: AboutJourneyHeaderContent = AboutJourneyHeaderContent()

# -------------------------------------------------------------------
# CONTACT PAGE CMS
# -------------------------------------------------------------------

class ContactPageHeroContent(BaseModel):
    eyebrow: Optional[str] = "Contact"
    title_black: Optional[str] = "Talk to"
    title_gold: Optional[str] = "real humans."
    sub: Optional[str] = "No bots, no ticket queues you never hear back from. Our small care team handles every message."

class ContactChannelContent(BaseModel):
    icon: str
    label: str
    value: str
    note: str

class SocialLink(BaseModel):
    platform: str
    url: str

class ContactSupportHoursContent(BaseModel):
    text: Optional[str] = "Support hours: Monday to Saturday, 10am – 7pm IST."

class ContactFormContent(BaseModel):
    title: Optional[str] = "Send us a message"

class ContactPageContentModel(BaseModel):
    hero: ContactPageHeroContent = ContactPageHeroContent()
    channels: List[ContactChannelContent] = [
        ContactChannelContent(icon="Mail", label="Email us", value="care@sonrup.in", note="Replies within one working day"),
        ContactChannelContent(icon="Phone", label="Call us", value="+91 98200 00000", note="Mon–Sat, 10am – 7pm IST"),
        ContactChannelContent(icon="MessageCircle", label="WhatsApp", value="+91 98200 00000", note="Fastest for order updates"),
        ContactChannelContent(icon="MapPin", label="Visit", value="Andheri East, Mumbai 400069", note="By appointment only"),
    ]
    support_hours: ContactSupportHoursContent = ContactSupportHoursContent()
    form: ContactFormContent = ContactFormContent()
    socials: Optional[List[SocialLink]] = [
        SocialLink(platform="Instagram", url="https://instagram.com/sonrup"),
        SocialLink(platform="Facebook", url="https://facebook.com/sonrup"),
        SocialLink(platform="YouTube", url="https://youtube.com/sonrup"),
        SocialLink(platform="WhatsApp", url="https://wa.me/919820000000"),
    ]


# -------------------------------------------------------------------
# JOURNAL PAGE CMS
# -------------------------------------------------------------------

class JournalPageHeroContent(BaseModel):
    eyebrow: Optional[str] = "The Journal"
    title_black: Optional[str] = "Straight answers about"
    title_gold: Optional[str] = "what you swallow."
    sub: Optional[str] = "No mysticism, no miracle claims. Just clear writing on ingredients, doses and the small habits that make a routine stick."

class JournalPageCtaContent(BaseModel):
    eyebrow: Optional[str] = "Read something you liked?"
    title: Optional[str] = "Put it into practice today."
    cta_text: Optional[str] = "Shop the range"
    cta_link: Optional[str] = "/shop"

class JournalPageContentModel(BaseModel):
    hero: JournalPageHeroContent = JournalPageHeroContent()
    cta: JournalPageCtaContent = JournalPageCtaContent()

class PostBlock(BaseModel):
    type: str = "text" # "text" or "image"
    content: str = ""

class PostModel(BaseModel):
    slug: str
    title: str
    category: str
    date: str
    read: str
    excerpt: str
    accent: str
    image: Optional[str] = ""
    body: List[PostBlock]

# -------------------------------------------------------------------
# POLICIES CMS
# -------------------------------------------------------------------

class PolicySection(BaseModel):
    heading: str
    body: List[str]

class PolicyModel(BaseModel):
    slug: str
    title: str
    updated: Optional[str] = ""
    intro: str
    sections: List[PolicySection]

# -------------------------------------------------------------------
# CONTACT SUBMISSIONS
# -------------------------------------------------------------------

class ContactSubmissionModel(BaseModel):
    name: str
    email: str
    phone: str
    message: str
    createdAt: Optional[str] = None

# -------------------------------------------------------------------
# BROADCAST PAYLOAD
# -------------------------------------------------------------------

class BroadcastPayload(BaseModel):
    subject: str
    message: str
    target: str

# -------------------------------------------------------------------
# LOGIN PAGE CMS
# -------------------------------------------------------------------

class LoginPageContentModel(BaseModel):
    image: str = "/multi-vitamin.jpg"
    subtitle: str = "Delicious Nutrition."
    description: str = "Formulated with care to make taking your vitamins the best part of your day. Your wellness journey starts here."

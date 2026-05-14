#!/usr/bin/env python3
"""
scripts/seed.py
───────────────
Seeds the local (or remote) Supabase instance with realistic test data.

Usage:
    python scripts/seed.py                         # default: 20 products, 15 orders
    python scripts/seed.py --products 30 --orders 20
    python scripts/seed.py --clear                 # clear seed data first

Activate venv first:
    .\\asrdivine\\Scripts\\activate
"""

import argparse
import os
import random
import sys
import uuid
from datetime import datetime, timedelta

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from faker import Faker
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env.local")
console = Console()
fake = Faker("en_IN")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# ── Data factories ─────────────────────────────────────────────────────────────

CATEGORIES = [
    {"name": "Chocolates",  "slug": "chocolates",  "is_active": True},
    {"name": "Cakes",       "slug": "cakes",       "is_active": True},
    {"name": "Cookies",     "slug": "cookies",     "is_active": True},
    {"name": "Gift Boxes",  "slug": "gift-boxes",  "is_active": True},
    {"name": "Seasonal",    "slug": "seasonal",    "is_active": True},
]

PRODUCT_NAMES = [
    "Dark Chocolate Truffle Box", "Belgian Milk Chocolate Bark",
    "Salted Caramel Truffles", "Single Origin 70% Dark Bar",
    "Hazelnut Praline Box", "White Chocolate Raspberry Bark",
    "Cocoa Nib Brittle", "Earl Grey Ganache Bonbons",
    "Passion Fruit Dark Truffles", "Smoked Sea Salt Caramel Chocolate",
    "Pistachio Rose Bark", "Cardamom Orange Dark Chocolate",
    "Espresso Brownie Bites", "Mango Chilli Dark Bark",
    "Classic Butter Cookies", "Almond Florentines",
    "Chocolate Dipped Biscotti", "Birthday Layer Cake",
    "Flourless Chocolate Torte", "Vegan Coconut Macaroons",
]

ORDER_STATUSES = ["pending", "confirmed", "in_preparation", "ready", "delivered", "cancelled"]


def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        console.print("[red]❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local[/red]")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def make_product(category_id: str, idx: int) -> dict:
    name = PRODUCT_NAMES[idx % len(PRODUCT_NAMES)]
    slug = name.lower().replace(" ", "-").replace("'", "") + f"-{idx}"
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "slug": slug,
        "description": fake.sentence(nb_words=12),
        "base_price": random.choice([249, 349, 449, 599, 799, 999, 1199, 1499]),
        "category_id": category_id,
        "is_active": True,
        "is_eggless": random.random() > 0.5,
        "is_seasonal": random.random() > 0.7,
        "is_bestseller": random.random() > 0.8,
        "stock_count": random.choice([None, None, 5, 10, 20, 50]),
        "tags": random.sample(["gifting", "dark", "milk", "vegan", "bestseller", "new"], k=2),
        "serving_size": f"Box of {random.choice([6, 9, 12, 16])} pieces",
        "shelf_life": f"{random.choice([5, 7, 10, 14])} days refrigerated",
    }


def make_order(product_ids: list[str], idx: int) -> tuple[dict, list[dict]]:
    status = random.choice(ORDER_STATUSES)
    created = datetime.utcnow() - timedelta(days=random.randint(0, 60))
    subtotal = random.randint(400, 3000)
    delivery = 0 if subtotal >= 999 else 80
    order_id = str(uuid.uuid4())

    order = {
        "id": order_id,
        "order_number": f"ASRD-{created.strftime('%Y%m%d')}-{(1000 + idx):05d}",
        "status": status,
        "payment_status": "paid" if status not in ("pending", "cancelled") else "pending",
        "fulfillment_type": random.choice(["delivery", "pickup"]),
        "subtotal": subtotal,
        "delivery_charge": delivery,
        "discount_amount": 0,
        "total": subtotal + delivery,
        "currency": "INR",
        "razorpay_order_id": f"order_seed_{uuid.uuid4().hex[:12]}",
        "razorpay_payment_id": f"pay_seed_{uuid.uuid4().hex[:12]}",
        "metadata": {
            "address": {
                "fullName": fake.name(),
                "line1": fake.street_address(),
                "city": "Pune",
                "state": "Maharashtra",
                "pincode": fake.postcode(),
                "phone": fake.phone_number(),
            }
        },
        "created_at": created.isoformat(),
        "updated_at": created.isoformat(),
    }

    items = []
    for prod_id in random.sample(product_ids, min(random.randint(1, 4), len(product_ids))):
        qty = random.randint(1, 3)
        price = random.choice([249, 349, 449, 599])
        items.append({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "product_id": prod_id,
            "product_name": PRODUCT_NAMES[random.randint(0, len(PRODUCT_NAMES) - 1)],
            "unit_price": price,
            "quantity": qty,
            "gift_wrap": random.random() > 0.8,
        })

    return order, items


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the ASR Divine database with test data.")
    parser.add_argument("--products", type=int, default=20, help="Number of products to seed (default: 20)")
    parser.add_argument("--orders",   type=int, default=15, help="Number of orders to seed (default: 15)")
    parser.add_argument("--clear", action="store_true", help="Clear existing seed data before inserting")
    args = parser.parse_args()

    db = get_client()

    console.print("\n[bold cyan]🍫 ASR Divine — Database Seeder[/bold cyan]")
    console.print(f"   Products: {args.products} | Orders: {args.orders} | Clear first: {args.clear}\n")

    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), transient=True) as progress:

        if args.clear:
            t = progress.add_task("Clearing old seed data…", total=None)
            db.from_("order_items").delete().like("order_id", "%-%-%-%-%").execute()
            db.from_("orders").delete().like("order_number", "ASRD-%-0%").execute()
            progress.update(t, description="Old data cleared ✓")

        # Categories
        t = progress.add_task("Upserting categories…", total=None)
        db.from_("categories").upsert(CATEGORIES, on_conflict="slug").execute()
        cat_ids = [r["id"] for r in (db.from_("categories").select("id").execute().data or [])]
        progress.update(t, description=f"Categories ✓ ({len(cat_ids)} total)")

        if not cat_ids:
            console.print("[red]❌  No category IDs after upsert — check RLS or connection.[/red]")
            sys.exit(1)

        # Products
        t = progress.add_task(f"Inserting {args.products} products…", total=None)
        product_rows = [make_product(random.choice(cat_ids), i) for i in range(args.products)]
        db.from_("products").upsert(product_rows, on_conflict="slug").execute()
        product_ids = [r["id"] for r in product_rows]
        progress.update(t, description=f"Products ✓ ({args.products} inserted)")

        # Orders
        t = progress.add_task(f"Inserting {args.orders} orders…", total=None)
        all_items: list[dict] = []
        for i in range(args.orders):
            order, items = make_order(product_ids, i)
            db.from_("orders").insert(order).execute()
            all_items.extend(items)
        if all_items:
            db.from_("order_items").insert(all_items).execute()
        progress.update(t, description=f"Orders ✓ ({args.orders} inserted, {len(all_items)} items)")

    console.print("\n[bold green]✅  Seeding complete![/bold green]")
    console.print(f"   • {len(CATEGORIES)} categories")
    console.print(f"   • {args.products} products")
    console.print(f"   • {args.orders} orders ({len(all_items)} line items)\n")


if __name__ == "__main__":
    main()

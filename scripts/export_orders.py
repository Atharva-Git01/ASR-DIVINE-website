#!/usr/bin/env python3
"""
scripts/export_orders.py
────────────────────────
Exports orders (with line items) from Supabase to a CSV file.

Usage:
    python scripts/export_orders.py                            # last 30 days → orders.csv
    python scripts/export_orders.py --days 90 --out report.csv
    python scripts/export_orders.py --status delivered
    python scripts/export_orders.py --all

Activate venv first:
    .\\asrdivine\\Scripts\\activate
"""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone

import pandas as pd
from rich.console import Console
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env.local")
console = Console()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        console.print("[red]❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local[/red]")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export Supabase orders to CSV.")
    parser.add_argument("--days", type=int, default=30,
                        help="Number of past days to include (default: 30, ignored with --all)")
    parser.add_argument("--out", default="orders.csv",
                        help="Output CSV file path (default: orders.csv)")
    parser.add_argument("--status", default="",
                        help="Filter by order status (e.g. delivered, cancelled)")
    parser.add_argument("--all", dest="all_orders", action="store_true",
                        help="Export all orders (ignores --days)")
    args = parser.parse_args()

    db = get_client()

    console.print("\n[bold cyan]🍫 ASR Divine — Order Export[/bold cyan]")

    query = db.from_("orders").select(
        "id, order_number, status, payment_status, fulfillment_type, "
        "subtotal, delivery_charge, discount_amount, total, currency, "
        "razorpay_order_id, razorpay_payment_id, created_at, metadata"
    )

    if not args.all_orders:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=args.days)).isoformat()
        query = query.gte("created_at", cutoff)
        console.print(f"   Date range: last {args.days} days")
    else:
        console.print("   Date range: all orders")

    if args.status:
        query = query.eq("status", args.status)
        console.print(f"   Status filter: {args.status}")

    result = query.order("created_at", desc=True).execute()
    orders = result.data or []

    if not orders:
        console.print("\n[yellow]No orders found matching your filters.[/yellow]\n")
        return

    console.print(f"   Orders found: {len(orders)}")

    order_ids = [o["id"] for o in orders]
    items_result = (
        db.from_("order_items")
        .select("order_id, product_name, variant_label, unit_price, quantity, gift_wrap")
        .in_("order_id", order_ids)
        .execute()
    )
    items = items_result.data or []

    items_by_order: dict[str, list[dict]] = {}
    for item in items:
        oid = item["order_id"]
        items_by_order.setdefault(oid, []).append(item)

    rows = []
    for order in orders:
        metadata = order.get("metadata") or {}
        address = metadata.get("address") or {}
        order_items = items_by_order.get(order["id"], [{}])
        for item in order_items:
            rows.append({
                "order_number":         order["order_number"],
                "status":               order["status"],
                "payment_status":       order["payment_status"],
                "fulfillment_type":     order["fulfillment_type"],
                "created_at":           order["created_at"],
                "product_name":         item.get("product_name", ""),
                "variant_label":        item.get("variant_label", ""),
                "unit_price":           item.get("unit_price", ""),
                "quantity":             item.get("quantity", ""),
                "gift_wrap":            item.get("gift_wrap", False),
                "subtotal":             order["subtotal"],
                "delivery_charge":      order["delivery_charge"],
                "discount":             order["discount_amount"],
                "total":                order["total"],
                "currency":             order["currency"],
                "customer_name":        address.get("fullName", ""),
                "customer_phone":       address.get("phone", ""),
                "city":                 address.get("city", ""),
                "pincode":              address.get("pincode", ""),
                "razorpay_order_id":    order.get("razorpay_order_id", ""),
                "razorpay_payment_id":  order.get("razorpay_payment_id", ""),
            })

    df = pd.DataFrame(rows)
    df.to_csv(args.out, index=False)

    total_rev = df["total"].astype(float).sum() if not df.empty else 0
    console.print(f"\n[bold green]✅  Exported {len(rows)} rows → {args.out}[/bold green]")
    console.print(f"   Total revenue in export: ₹{total_rev:,.0f}\n")


if __name__ == "__main__":
    main()

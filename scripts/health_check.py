#!/usr/bin/env python3
"""
scripts/health_check.py
───────────────────────
Hits the tRPC health endpoint and key API routes, reports their status.

Usage:
    python scripts/health_check.py                          # checks http://localhost:3000
    python scripts/health_check.py --base-url https://...  # checks production

Activate venv first:
    .\\asrdivine\\Scripts\\activate
"""

import argparse
import sys
import time

import httpx
from rich.console import Console
from rich.table import Table

console = Console()

ENDPOINTS = [
    ("GET",  "/api/trpc/health",          "tRPC health"),
    ("GET",  "/api/trpc/categories.list",  "tRPC categories"),
    ("GET",  "/api/trpc/products.list",    "tRPC products"),
    ("POST", "/api/payment/create-order",  "Payment create-order (expects 400)"),
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Health-check ASR Divine endpoints.")
    parser.add_argument("--base-url", default="http://localhost:3000",
                        help="Base URL of the running app (default: http://localhost:3000)")
    parser.add_argument("--timeout", type=float, default=10.0,
                        help="Request timeout in seconds (default: 10)")
    args = parser.parse_args()

    console.print(f"\n[bold cyan]🍫 ASR Divine — Health Check[/bold cyan]")
    console.print(f"   Base URL: {args.base_url}\n")

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Method", style="dim", width=6)
    table.add_column("Path", min_width=40)
    table.add_column("Description", min_width=35)
    table.add_column("Status", justify="center")
    table.add_column("Latency", justify="right")

    all_ok = True

    with httpx.Client(base_url=args.base_url, timeout=args.timeout) as client:
        for method, path, description in ENDPOINTS:
            start = time.perf_counter()
            try:
                resp = client.get(path) if method == "GET" else client.post(path, json={})
                elapsed_ms = (time.perf_counter() - start) * 1000
                code = resp.status_code
                ok = code < 500
                color = "green" if ok else "red"
                status_str = f"[{color}]{code}[/{color}]"
                if not ok:
                    all_ok = False
            except httpx.RequestError as exc:
                elapsed_ms = (time.perf_counter() - start) * 1000
                status_str = "[red]ERR[/red]"
                description = f"{description} — {exc}"
                all_ok = False

            table.add_row(method, path, description, status_str, f"{elapsed_ms:.0f} ms")

    console.print(table)

    if all_ok:
        console.print("\n[bold green]✅  All endpoints responding normally.[/bold green]\n")
    else:
        console.print("\n[bold red]❌  Some endpoints are unhealthy. Check the table above.[/bold red]\n")
        sys.exit(1)


if __name__ == "__main__":
    main()

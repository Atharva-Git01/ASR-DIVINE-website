#!/usr/bin/env python3
"""
scripts/validate_env.py
───────────────────────
Checks that all required environment variables are present before a deploy.
Reads from .env.local (development) or the shell environment (CI/CD).

Usage:
    python scripts/validate_env.py
    python scripts/validate_env.py .env.production
    python scripts/validate_env.py --strict

Exit codes:
    0 — all required vars present
    1 — one or more vars missing or invalid

Activate venv first:
    .\\asrdivine\\Scripts\\activate
"""

import argparse
import os
import sys

from rich.console import Console
from rich.table import Table
from dotenv import load_dotenv

console = Console()

# ── Variable definitions ──────────────────────────────────────────────────────

REQUIRED: list[tuple[str, str]] = [
    ("NEXT_PUBLIC_SUPABASE_URL",     "Supabase project URL (public)"),
    ("NEXT_PUBLIC_SUPABASE_ANON_KEY","Supabase anon key (public)"),
    ("SUPABASE_SERVICE_ROLE_KEY",    "Supabase service role key (secret)"),
    ("NEXTAUTH_SECRET",              "NextAuth JWT secret (min 32 chars)"),
    ("NEXTAUTH_URL",                 "App base URL for NextAuth redirects"),
    ("NEXT_PUBLIC_RAZORPAY_KEY_ID",  "Razorpay publishable key"),
    ("RAZORPAY_KEY_SECRET",          "Razorpay secret key"),
    ("RAZORPAY_WEBHOOK_SECRET",      "Razorpay webhook verification secret"),
    ("NEXT_PUBLIC_APP_URL",          "App public base URL"),
]

OPTIONAL: list[tuple[str, str]] = [
    ("GOOGLE_CLIENT_ID",             "Google OAuth client ID"),
    ("GOOGLE_CLIENT_SECRET",         "Google OAuth client secret"),
    ("UPSTASH_REDIS_REST_URL",       "Upstash Redis URL (rate limiting)"),
    ("UPSTASH_REDIS_REST_TOKEN",     "Upstash Redis token (rate limiting)"),
    ("RESEND_API_KEY",               "Resend email API key"),
    ("WHATSAPP_PHONE_NUMBER_ID",     "WhatsApp Cloud API phone number ID"),
    ("WHATSAPP_ACCESS_TOKEN",        "WhatsApp Cloud API access token"),
    ("NEXT_PUBLIC_SENTRY_DSN",       "Sentry DSN for error tracking"),
    ("SENTRY_ORG",                   "Sentry organisation slug"),
    ("SENTRY_PROJECT",               "Sentry project slug"),
]

VALIDATIONS: dict[str, tuple[str, object]] = {
    "NEXT_PUBLIC_SUPABASE_URL":    ("must start with https://",               lambda v: v.startswith("https://")),
    "NEXTAUTH_URL":                ("must start with http:// or https://",     lambda v: v.startswith("http")),
    "NEXT_PUBLIC_APP_URL":         ("must start with http:// or https://",     lambda v: v.startswith("http")),
    "NEXTAUTH_SECRET":             ("must be at least 32 characters",          lambda v: len(v) >= 32),
    "NEXT_PUBLIC_RAZORPAY_KEY_ID": ("must start with rzp_",                   lambda v: v.startswith("rzp_")),
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate required environment variables.")
    parser.add_argument("env_file", nargs="?", default=".env.local",
                        help="Path to .env file to load (default: .env.local)")
    parser.add_argument("--strict", action="store_true",
                        help="Fail even if optional vars are missing")
    parser.add_argument("--production", action="store_true",
                        help="Fail on deploy-unsafe placeholder or test payment values")
    args = parser.parse_args()

    if os.path.exists(args.env_file):
        load_dotenv(args.env_file, override=False)
        console.print(f"\n[dim]Loaded: {args.env_file}[/dim]")
    else:
        console.print(f"\n[yellow]⚠  {args.env_file} not found — checking shell environment only[/yellow]")

    console.print("\n[bold cyan]🍫 ASR Divine — Environment Validation[/bold cyan]\n")

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Variable", min_width=38)
    table.add_column("Description", min_width=35)
    table.add_column("Status", justify="center")
    table.add_column("Notes")

    errors: list[str] = []
    warnings: list[str] = []

    def check_var(name: str, description: str, required: bool) -> None:
        value = os.getenv(name, "")
        if not value:
            status = "[red]MISSING[/red]" if required else "[yellow]absent[/yellow]"
            note = "Required" if required else "Optional"
            table.add_row(name, description, status, note)
            (errors if required else warnings).append(name)
            return

        if name in VALIDATIONS:
            rule_desc, validator = VALIDATIONS[name]
            try:
                ok = bool(validator(value))  # type: ignore[operator]
            except Exception:
                ok = False
            if not ok:
                table.add_row(name, description, "[red]INVALID[/red]", str(rule_desc))
                errors.append(f"{name} ({rule_desc})")
                return

        if args.production:
            deploy_error = None
            lower_value = value.lower()
            if name == "NEXT_PUBLIC_RAZORPAY_KEY_ID" and not value.startswith("rzp_live_"):
                deploy_error = "production deploy requires a Razorpay live key (rzp_live_*)"
            elif name in {"RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"} and (
                "placeholder" in lower_value or lower_value.startswith("your-")
            ):
                deploy_error = "production deploy requires a real Razorpay secret"

            if deploy_error:
                table.add_row(name, description, "[red]INVALID[/red]", deploy_error)
                errors.append(f"{name} ({deploy_error})")
                return

        # Mask secrets in output
        is_secret = any(tok in name for tok in ("KEY", "SECRET", "TOKEN"))
        display = (value[:8] + "…") if is_secret and len(value) > 8 else "✓ set"
        table.add_row(name, description, "[green]OK[/green]", display)

    for name, desc in REQUIRED:
        check_var(name, desc, required=True)
    for name, desc in OPTIONAL:
        check_var(name, desc, required=False)

    console.print(table)

    if errors:
        console.print(f"\n[bold red]❌  {len(errors)} error(s) found:[/bold red]")
        for e in errors:
            console.print(f"   • {e}")
        console.print("")
        sys.exit(1)
    elif warnings and args.strict:
        console.print(f"\n[yellow]⚠  {len(warnings)} optional var(s) absent (--strict mode):[/yellow]")
        for w in warnings:
            console.print(f"   • {w}")
        sys.exit(1)
    else:
        if warnings:
            console.print(f"\n[yellow]⚠  {len(warnings)} optional var(s) absent — notifications / Sentry may not work.[/yellow]")
        console.print("\n[bold green]✅  All required environment variables are set.[/bold green]\n")


if __name__ == "__main__":
    main()

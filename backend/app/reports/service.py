from decimal import Decimal

from sqlalchemy import and_, extract, func
from sqlalchemy.orm import Session

from app.core.models import Category, MonthlyEstimate, Transaction


def get_dashboard(db: Session, user_id: str, year: int, month: int) -> dict:
    # Total income and expenses for the month
    totals = (
        db.query(Transaction.type, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .group_by(Transaction.type)
        .all()
    )
    total_income = Decimal("0.00")
    total_expenses = Decimal("0.00")
    for row in totals:
        if row.type == "income":
            total_income = Decimal(str(row.total))
        elif row.type == "expense":
            total_expenses = Decimal(str(row.total))

    net_balance = total_income - total_expenses

    # 5 most recent transactions
    recent = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(5)
        .all()
    )

    # Budget alerts: categories where actual > estimated
    actuals = (
        db.query(Transaction.category_id, Transaction.type, func.sum(Transaction.amount).label("actual"))
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .group_by(Transaction.category_id, Transaction.type)
        .all()
    )

    actual_map = {(r.category_id, r.type): Decimal(str(r.actual)) for r in actuals}

    estimates = (
        db.query(MonthlyEstimate)
        .filter(
            MonthlyEstimate.user_id == user_id,
            MonthlyEstimate.year == year,
            MonthlyEstimate.month == month,
        )
        .all()
    )

    budget_alerts = []
    for est in estimates:
        actual = actual_map.get((est.category_id, est.type), Decimal("0.00"))
        estimated = Decimal(str(est.amount))
        if actual > estimated:
            budget_alerts.append(
                {
                    "category": {"id": est.category_id, "name": est.category.name},
                    "estimated": f"{estimated:.2f}",
                    "actual": f"{actual:.2f}",
                    "over_budget": True,
                }
            )

    return {
        "year": year,
        "month": month,
        "total_income": f"{total_income:.2f}",
        "total_expenses": f"{total_expenses:.2f}",
        "net_balance": f"{net_balance:.2f}",
        "recent_transactions": [
            {
                "id": t.id,
                "date": str(t.date),
                "amount": f"{Decimal(str(t.amount)):.2f}",
                "type": t.type,
                "category": {"id": t.category_id, "name": t.category.name},
                "modality": t.modality,
            }
            for t in recent
        ],
        "budget_alerts": budget_alerts,
    }


def get_monthly_report(db: Session, user_id: str, year: int, month: int) -> dict:
    # Trigger lazy estimate carryover
    from app.estimates.service import get_estimates_for_month
    estimates = get_estimates_for_month(db, user_id, year, month)

    # Aggregate actuals by category + type
    actuals = (
        db.query(Transaction.category_id, Transaction.type, func.sum(Transaction.amount).label("actual"))
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .group_by(Transaction.category_id, Transaction.type)
        .all()
    )
    actual_map = {(r.category_id, r.type): Decimal(str(r.actual)) for r in actuals}

    # Build report rows, indexed by (category_id, type)
    # Include estimate rows plus any actuals without estimates
    estimate_keys = {(e.category_id, e.type) for e in estimates}
    actual_keys = set(actual_map.keys())
    all_keys = estimate_keys | actual_keys

    # Load all relevant categories
    cat_ids = {k[0] for k in all_keys}
    categories = {c.id: c for c in db.query(Category).filter(Category.id.in_(cat_ids)).all()} if cat_ids else {}

    expense_rows = []
    income_rows = []
    for cat_id, typ in sorted(all_keys, key=lambda k: categories.get(k[0], Category()).name if k[0] in categories else ""):
        cat = categories.get(cat_id)
        cat_name = cat.name if cat else "Unknown"
        est_amount = next((Decimal(str(e.amount)) for e in estimates if e.category_id == cat_id and e.type == typ), Decimal("0.00"))
        actual = actual_map.get((cat_id, typ), Decimal("0.00"))
        difference = est_amount - actual
        row = {
            "category": {"id": cat_id, "name": cat_name},
            "estimated": f"{est_amount:.2f}",
            "actual": f"{actual:.2f}",
            "difference": f"{difference:.2f}",
            "over_budget": actual > est_amount,
        }
        if typ == "expense":
            expense_rows.append(row)
        else:
            income_rows.append(row)

    total_est_exp = sum(Decimal(r["estimated"]) for r in expense_rows)
    total_act_exp = sum(Decimal(r["actual"]) for r in expense_rows)
    total_est_inc = sum(Decimal(r["estimated"]) for r in income_rows)
    total_act_inc = sum(Decimal(r["actual"]) for r in income_rows)

    return {
        "year": year,
        "month": month,
        "expenses": expense_rows,
        "income": income_rows,
        "summary": {
            "total_estimated_expenses": f"{total_est_exp:.2f}",
            "total_actual_expenses": f"{total_act_exp:.2f}",
            "total_estimated_income": f"{total_est_inc:.2f}",
            "total_actual_income": f"{total_act_inc:.2f}",
        },
    }

"""initial schema

Revision ID: ba61b47c8263
Revises:
Create Date: 2026-03-22 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "ba61b47c8263"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "users",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "bank_accounts",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "categories",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("archived_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "cards",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("bank_account_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("bank_accounts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("type IN ('credit', 'debit')", name="card_type_check"),
    )

    op.create_table(
        "recurring_transactions",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("category_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("modality", sa.String(20), nullable=False),
        sa.Column("bank_account_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("bank_accounts.id"), nullable=True),
        sa.Column("card_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("cards.id"), nullable=True),
        sa.Column("due_day", sa.SmallInteger, nullable=False),
        sa.Column("active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("amount > 0", name="recurring_amount_positive"),
        sa.CheckConstraint("type IN ('expense', 'income')", name="recurring_type_check"),
        sa.CheckConstraint("modality IN ('dinheiro','debito','credito','pix','transferencia')", name="recurring_modality_check"),
        sa.CheckConstraint("due_day BETWEEN 1 AND 31", name="recurring_due_day_check"),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("category_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("modality", sa.String(20), nullable=False),
        sa.Column("bank_account_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("bank_accounts.id"), nullable=True),
        sa.Column("card_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("cards.id"), nullable=True),
        sa.Column("recurring_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("recurring_transactions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("amount > 0", name="transaction_amount_positive"),
        sa.CheckConstraint("type IN ('expense', 'income')", name="transaction_type_check"),
        sa.CheckConstraint("modality IN ('dinheiro','debito','credito','pix','transferencia')", name="transaction_modality_check"),
    )

    op.create_table(
        "monthly_estimates",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", sa.dialects.postgresql.UUID(as_uuid=False), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("year", sa.SmallInteger, nullable=False),
        sa.Column("month", sa.SmallInteger, nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("month BETWEEN 1 AND 12", name="estimate_month_check"),
        sa.CheckConstraint("amount >= 0", name="estimate_amount_non_negative"),
        sa.CheckConstraint("type IN ('expense', 'income')", name="estimate_type_check"),
        sa.UniqueConstraint("user_id", "category_id", "year", "month", "type", name="uq_estimate_per_category_month"),
    )

    # Indexes
    op.create_index("idx_transactions_user_date", "transactions", ["user_id", "date"])
    op.create_index("idx_recurring_user_active", "recurring_transactions", ["user_id", "active"])
    op.create_index("idx_estimates_user_month", "monthly_estimates", ["user_id", "year", "month"])
    op.create_index(
        "idx_categories_user_active",
        "categories",
        ["user_id"],
        postgresql_where=sa.text("archived_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_table("monthly_estimates")
    op.drop_table("transactions")
    op.drop_table("recurring_transactions")
    op.drop_table("cards")
    op.drop_table("categories")
    op.drop_table("bank_accounts")
    op.drop_table("users")

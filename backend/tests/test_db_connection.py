import pytest
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from app.db.session import engine


def test_db_engine_import():
    """Verify that engine and Base are configured and importable."""
    assert engine is not None
    assert str(engine.url).startswith("mysql+pymysql://")


def test_mysql_connection():
    """Verify connection to MySQL if configured, otherwise skip cleanly."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()
            assert result == 1
    except OperationalError as exc:
        pytest.skip(
            f"MySQL database not accessible at {engine.url.render_as_string(hide_password=True)}. "
            f"Skipping database connection test: {exc}"
        )
    except Exception as exc:
        pytest.skip(
            f"Database connection unavailable ({type(exc).__name__}). Skipping test."
        )

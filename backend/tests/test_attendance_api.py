import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
import app.models  # noqa: F401 - ensure all models loaded


# Set up isolated in-memory SQLite database for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_test_database():
    """Create all schema tables before each test and drop them afterwards."""
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def test_department(client: TestClient):
    """Fixture that creates a test department."""
    res = client.post(
        "/api/v1/departments",
        json={"name": "Engineering", "description": "Software Engineering"},
    )
    assert res.status_code == 201
    return res.json()


@pytest.fixture
def test_intern(client: TestClient, test_department: dict):
    """Fixture that creates a test intern."""
    res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "department_id": test_department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    assert res.status_code == 201
    return res.json()


@pytest.fixture
def test_intern2(client: TestClient, test_department: dict):
    """Fixture that creates a second test intern."""
    res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-002",
            "full_name": "Alex Johnson",
            "email": "alex.johnson@example.com",
            "department_id": test_department["id"],
            "role": "Backend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    assert res.status_code == 201
    return res.json()


def test_list_attendance_empty(client: TestClient):
    """Verify listing attendance returns an empty array when no records exist."""
    response = client.get("/api/v1/attendance")
    assert response.status_code == 200
    assert response.json() == []


def test_create_attendance_success(client: TestClient, test_intern: dict):
    """Verify creating a valid attendance record returns 201 Created and correct fields."""
    payload = {
        "intern_id": test_intern["id"],
        "attendance_date": "2026-06-15",
        "status": "PRESENT",
        "remarks": "On-time check-in via badge",
    }
    response = client.post("/api/v1/attendance", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["intern_id"] == test_intern["id"]
    assert data["attendance_date"] == "2026-06-15"
    assert data["status"] == "PRESENT"
    assert data["remarks"] == "On-time check-in via badge"
    assert "created_at" in data


def test_create_attendance_missing_intern_not_found(client: TestClient):
    """Verify creating attendance for a non-existent intern returns 404."""
    payload = {
        "intern_id": 99999,
        "attendance_date": "2026-06-15",
        "status": "PRESENT",
    }
    response = client.post("/api/v1/attendance", json=payload)
    assert response.status_code == 404
    assert "Intern with ID 99999 not found" in response.json()["detail"]


def test_create_duplicate_attendance_conflict(client: TestClient, test_intern: dict):
    """Verify creating duplicate attendance for same intern and date returns 409 Conflict."""
    payload = {
        "intern_id": test_intern["id"],
        "attendance_date": "2026-06-15",
        "status": "PRESENT",
    }
    res1 = client.post("/api/v1/attendance", json=payload)
    assert res1.status_code == 201

    # Attempt second record on same date
    payload2 = {
        "intern_id": test_intern["id"],
        "attendance_date": "2026-06-15",
        "status": "ABSENT",
    }
    res2 = client.post("/api/v1/attendance", json=payload2)
    assert res2.status_code == 409
    assert "already recorded" in res2.json()["detail"]


def test_get_attendance_by_id_success(client: TestClient, test_intern: dict):
    """Verify retrieving a single attendance record by ID."""
    create_res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "LEAVE",
            "remarks": "Medical appointment",
        },
    )
    record_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/attendance/{record_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == record_id
    assert data["status"] == "LEAVE"
    assert data["remarks"] == "Medical appointment"


def test_get_attendance_by_id_not_found(client: TestClient):
    """Verify retrieving non-existent attendance ID returns 404."""
    response = client.get("/api/v1/attendance/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_attendance_success(client: TestClient, test_intern: dict):
    """Verify updating status and remarks of an existing attendance record."""
    create_res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "ABSENT",
        },
    )
    record_id = create_res.json()["id"]

    update_payload = {
        "status": "PRESENT",
        "remarks": "Marked present retroactively after manager approval",
    }
    put_res = client.put(f"/api/v1/attendance/{record_id}", json=update_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["status"] == "PRESENT"
    assert data["remarks"] == "Marked present retroactively after manager approval"


def test_update_attendance_into_duplicate_conflict(
    client: TestClient, test_intern: dict
):
    """Verify updating a record's date/intern to an already existing intern+date pair returns 409."""
    # Create record 1 on June 15
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )

    # Create record 2 on June 16
    rec2 = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-16",
            "status": "PRESENT",
        },
    ).json()

    # Attempt to change record 2's date to June 15
    put_res = client.put(
        f"/api/v1/attendance/{rec2['id']}",
        json={"attendance_date": "2026-06-15"},
    )
    assert put_res.status_code == 409
    assert "already recorded" in put_res.json()["detail"]


def test_filter_attendance_by_intern_id(
    client: TestClient, test_intern: dict, test_intern2: dict
):
    """Verify filtering attendance logs by intern_id."""
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern2["id"],
            "attendance_date": "2026-06-15",
            "status": "ABSENT",
        },
    )

    res = client.get(f"/api/v1/attendance?intern_id={test_intern['id']}")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["intern_id"] == test_intern["id"]


def test_filter_attendance_by_status(client: TestClient, test_intern: dict):
    """Verify filtering attendance logs by status enum."""
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-16",
            "status": "LEAVE",
        },
    )

    res = client.get("/api/v1/attendance?status=LEAVE")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["status"] == "LEAVE"
    assert results[0]["attendance_date"] == "2026-06-16"


def test_filter_attendance_by_date(
    client: TestClient, test_intern: dict, test_intern2: dict
):
    """Verify filtering attendance logs for a specific calendar date."""
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern2["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-16",
            "status": "PRESENT",
        },
    )

    res = client.get("/api/v1/attendance?date=2026-06-15")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 2
    for r in results:
        assert r["attendance_date"] == "2026-06-15"


def test_delete_attendance_success(client: TestClient, test_intern: dict):
    """Verify deleting an attendance record returns 204 and removes record."""
    create_res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": test_intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    record_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/attendance/{record_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/v1/attendance/{record_id}")
    assert get_res.status_code == 404


def test_delete_attendance_not_found(client: TestClient):
    """Verify deleting non-existent attendance record returns 404."""
    response = client.delete("/api/v1/attendance/99999")
    assert response.status_code == 404


def test_openapi_schema_contains_attendance(client: TestClient):
    """Verify attendance endpoints are documented in OpenAPI schema."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]

    assert "/api/v1/attendance" in paths
    assert "get" in paths["/api/v1/attendance"]
    assert "post" in paths["/api/v1/attendance"]
    assert "/api/v1/attendance/{attendance_id}" in paths
    assert "get" in paths["/api/v1/attendance/{attendance_id}"]
    assert "put" in paths["/api/v1/attendance/{attendance_id}"]
    assert "delete" in paths["/api/v1/attendance/{attendance_id}"]

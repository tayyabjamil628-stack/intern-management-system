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
def department(client: TestClient):
    """Fixture that creates a test department."""
    res = client.post(
        "/api/v1/departments",
        json={"name": "Engineering", "description": "Software Engineering"},
    )
    assert res.status_code == 201
    return res.json()


@pytest.fixture
def department2(client: TestClient):
    """Fixture that creates a second test department."""
    res = client.post(
        "/api/v1/departments",
        json={"name": "Product Design", "description": "UI/UX Design"},
    )
    assert res.status_code == 201
    return res.json()


def test_list_interns_empty(client: TestClient):
    """Verify listing interns returns an empty array when no interns exist."""
    response = client.get("/api/v1/interns")
    assert response.status_code == 200
    assert response.json() == []


def test_create_intern_success(client: TestClient, department: dict):
    """Verify creating a valid intern returns 201 Created and correct fields."""
    payload = {
        "intern_id": "INT-2026-001",
        "full_name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "phone": "+1-555-0100",
        "department_id": department["id"],
        "role": "Frontend Engineering Intern",
        "university": "Stanford University",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
        "status": "ACTIVE",
    }
    response = client.post("/api/v1/interns", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["intern_id"] == "INT-2026-001"
    assert data["full_name"] == "Sarah Chen"
    assert data["email"] == "sarah.chen@example.com"
    assert data["department_id"] == department["id"]
    assert data["status"] == "ACTIVE"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_intern_duplicate_intern_id_conflict(client: TestClient, department: dict):
    """Verify duplicate intern_id returns 409 Conflict."""
    payload = {
        "intern_id": "INT-2026-001",
        "full_name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "department_id": department["id"],
        "role": "Frontend Intern",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
    }
    res1 = client.post("/api/v1/interns", json=payload)
    assert res1.status_code == 201

    payload2 = {
        "intern_id": "INT-2026-001",
        "full_name": "Different Name",
        "email": "other.email@example.com",
        "department_id": department["id"],
        "role": "Backend Intern",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
    }
    res2 = client.post("/api/v1/interns", json=payload2)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_create_intern_duplicate_email_conflict(client: TestClient, department: dict):
    """Verify duplicate email returns 409 Conflict."""
    payload1 = {
        "intern_id": "INT-2026-001",
        "full_name": "Sarah Chen",
        "email": "shared.email@example.com",
        "department_id": department["id"],
        "role": "Frontend Intern",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
    }
    res1 = client.post("/api/v1/interns", json=payload1)
    assert res1.status_code == 201

    payload2 = {
        "intern_id": "INT-2026-002",
        "full_name": "Alex Johnson",
        "email": "shared.email@example.com",
        "department_id": department["id"],
        "role": "Backend Intern",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
    }
    res2 = client.post("/api/v1/interns", json=payload2)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_create_intern_invalid_email_format(client: TestClient, department: dict):
    """Verify invalid email format is rejected with 422 Unprocessable Entity."""
    payload = {
        "intern_id": "INT-2026-001",
        "full_name": "Sarah Chen",
        "email": "invalid-email-string",
        "department_id": department["id"],
        "role": "Frontend Intern",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
    }
    response = client.post("/api/v1/interns", json=payload)
    assert response.status_code == 422


def test_create_intern_missing_department_not_found(client: TestClient):
    """Verify non-existent department_id returns 404 Not Found."""
    payload = {
        "intern_id": "INT-2026-001",
        "full_name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "department_id": 99999,
        "role": "Frontend Intern",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
    }
    response = client.post("/api/v1/interns", json=payload)
    assert response.status_code == 404
    assert "Department with ID 99999 not found" in response.json()["detail"]


def test_create_intern_end_date_before_start_date(client: TestClient, department: dict):
    """Verify invalid date range (end_date < start_date) returns 422."""
    payload = {
        "intern_id": "INT-2026-001",
        "full_name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "department_id": department["id"],
        "role": "Frontend Intern",
        "start_date": "2026-08-31",
        "end_date": "2026-06-01",
    }
    response = client.post("/api/v1/interns", json=payload)
    assert response.status_code == 422


def test_get_intern_by_id_success(client: TestClient, department: dict):
    """Verify retrieving a single intern by ID."""
    create_res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    intern_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/interns/{intern_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == intern_id
    assert data["full_name"] == "Sarah Chen"
    assert data["intern_id"] == "INT-2026-001"


def test_get_intern_by_id_not_found(client: TestClient):
    """Verify retrieving non-existent intern returns 404."""
    response = client.get("/api/v1/interns/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_intern_success(client: TestClient, department: dict, department2: dict):
    """Verify updating intern profile details and assigned department."""
    create_res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    intern_id = create_res.json()["id"]

    update_payload = {
        "role": "Senior Frontend Intern",
        "department_id": department2["id"],
        "status": "COMPLETED",
    }
    put_res = client.put(f"/api/v1/interns/{intern_id}", json=update_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["role"] == "Senior Frontend Intern"
    assert data["department_id"] == department2["id"]
    assert data["status"] == "COMPLETED"


def test_update_intern_duplicate_email_conflict(client: TestClient, department: dict):
    """Verify updating email to another intern's existing email returns 409."""
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    intern2 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-002",
            "full_name": "Alex Johnson",
            "email": "alex.johnson@example.com",
            "department_id": department["id"],
            "role": "Backend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    # Attempt to update Alex's email to Sarah's
    res = client.put(
        f"/api/v1/interns/{intern2['id']}",
        json={"email": "sarah.chen@example.com"},
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"]


def test_search_interns(client: TestClient, department: dict):
    """Verify searching across full_name, intern_id, and email."""
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-002",
            "full_name": "Michael Brown",
            "email": "michael.brown@chen-labs.com",
            "department_id": department["id"],
            "role": "Data Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-003",
            "full_name": "Emily Davis",
            "email": "emily@example.com",
            "department_id": department["id"],
            "role": "UX Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )

    # Search matches Sarah (name) and Michael (email contains chen)
    res = client.get("/api/v1/interns?search=Chen")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 2
    intern_ids = {r["intern_id"] for r in results}
    assert intern_ids == {"INT-2026-001", "INT-2026-002"}


def test_filter_interns_by_department(
    client: TestClient, department: dict, department2: dict
):
    """Verify filtering interns by department_id."""
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-002",
            "full_name": "Alex Johnson",
            "email": "alex@example.com",
            "department_id": department2["id"],
            "role": "Designer Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )

    res = client.get(f"/api/v1/interns?department_id={department['id']}")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["intern_id"] == "INT-2026-001"


def test_filter_interns_by_status(client: TestClient, department: dict):
    """Verify filtering interns by lifecycle status."""
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-002",
            "full_name": "Alex Johnson",
            "email": "alex@example.com",
            "department_id": department["id"],
            "role": "Backend Intern",
            "start_date": "2026-01-01",
            "end_date": "2026-04-30",
            "status": "COMPLETED",
        },
    )

    res = client.get("/api/v1/interns?status=COMPLETED")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["intern_id"] == "INT-2026-002"


def test_delete_intern_success(client: TestClient, department: dict):
    """Verify deleting an intern returns 204 No Content and removes the record."""
    create_res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-2026-001",
            "full_name": "Sarah Chen",
            "email": "sarah@example.com",
            "department_id": department["id"],
            "role": "Frontend Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    intern_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/interns/{intern_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/v1/interns/{intern_id}")
    assert get_res.status_code == 404


def test_delete_intern_not_found(client: TestClient):
    """Verify deleting non-existent intern returns 404."""
    response = client.delete("/api/v1/interns/99999")
    assert response.status_code == 404


def test_openapi_schema_contains_interns(client: TestClient):
    """Verify intern endpoints are documented in OpenAPI schema."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]

    assert "/api/v1/interns" in paths
    assert "get" in paths["/api/v1/interns"]
    assert "post" in paths["/api/v1/interns"]
    assert "/api/v1/interns/{intern_id}" in paths
    assert "get" in paths["/api/v1/interns/{intern_id}"]
    assert "put" in paths["/api/v1/interns/{intern_id}"]
    assert "delete" in paths["/api/v1/interns/{intern_id}"]

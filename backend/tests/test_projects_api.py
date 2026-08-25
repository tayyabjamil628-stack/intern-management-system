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


def test_list_projects_empty(client: TestClient):
    """Verify listing projects returns empty array when no records exist."""
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert response.json() == []


def test_create_project_success(client: TestClient, test_intern: dict):
    """Verify creating a project returns 201 Created and correct schema."""
    payload = {
        "name": "Intern Portal Dashboard",
        "description": "Design and build responsive admin analytics dashboard",
        "intern_id": test_intern["id"],
        "start_date": "2026-06-15",
        "deadline": "2026-08-15",
        "status": "IN_PROGRESS",
        "progress": 45,
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Intern Portal Dashboard"
    assert data["description"] == "Design and build responsive admin analytics dashboard"
    assert data["intern_id"] == test_intern["id"]
    assert data["status"] == "IN_PROGRESS"
    assert data["progress"] == 45
    assert "created_at" in data
    assert "updated_at" in data


def test_create_project_missing_intern_not_found(client: TestClient):
    """Verify creating a project with non-existent intern_id returns 404."""
    payload = {
        "name": "Orphan Project",
        "intern_id": 99999,
        "start_date": "2026-06-15",
        "deadline": "2026-08-15",
        "status": "NOT_STARTED",
        "progress": 0,
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 404
    assert "Intern with ID 99999 not found" in response.json()["detail"]


def test_create_project_invalid_date_range(client: TestClient, test_intern: dict):
    """Verify deadline earlier than start_date is rejected with 422."""
    payload = {
        "name": "Time Travel Project",
        "intern_id": test_intern["id"],
        "start_date": "2026-08-15",
        "deadline": "2026-06-15",
        "status": "NOT_STARTED",
        "progress": 0,
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 422


def test_create_project_progress_below_zero(client: TestClient, test_intern: dict):
    """Verify progress < 0 is rejected with 422."""
    payload = {
        "name": "Negative Progress Project",
        "intern_id": test_intern["id"],
        "start_date": "2026-06-15",
        "deadline": "2026-08-15",
        "status": "NOT_STARTED",
        "progress": -5,
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 422


def test_create_project_progress_above_hundred(client: TestClient, test_intern: dict):
    """Verify progress > 100 is rejected with 422."""
    payload = {
        "name": "Overachieving Project",
        "intern_id": test_intern["id"],
        "start_date": "2026-06-15",
        "deadline": "2026-08-15",
        "status": "NOT_STARTED",
        "progress": 150,
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 422


def test_create_project_completed_normalizes_progress(
    client: TestClient, test_intern: dict
):
    """Verify status COMPLETED automatically normalizes progress to 100."""
    payload = {
        "name": "Completed Feature",
        "intern_id": test_intern["id"],
        "start_date": "2026-06-15",
        "deadline": "2026-08-15",
        "status": "COMPLETED",
        "progress": 30,  # Should be normalized to 100
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["progress"] == 100


def test_get_project_by_id_success(client: TestClient, test_intern: dict):
    """Verify retrieving a project by ID."""
    create_res = client.post(
        "/api/v1/projects",
        json={
            "name": "GraphQL Integration",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "IN_PROGRESS",
            "progress": 50,
        },
    )
    project_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == project_id
    assert data["name"] == "GraphQL Integration"


def test_get_project_by_id_not_found(client: TestClient):
    """Verify non-existent project returns 404."""
    response = client.get("/api/v1/projects/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_project_success(
    client: TestClient, test_intern: dict, test_intern2: dict
):
    """Verify updating project fields, status, and assigned intern."""
    create_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Initial Feature",
            "description": "Initial task",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "NOT_STARTED",
            "progress": 0,
        },
    )
    project_id = create_res.json()["id"]

    update_payload = {
        "name": "Updated Microservice Feature",
        "intern_id": test_intern2["id"],
        "status": "COMPLETED",
        "progress": 80,  # Should normalize to 100 because COMPLETED
    }
    put_res = client.put(f"/api/v1/projects/{project_id}", json=update_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["name"] == "Updated Microservice Feature"
    assert data["intern_id"] == test_intern2["id"]
    assert data["status"] == "COMPLETED"
    assert data["progress"] == 100


def test_search_projects(client: TestClient, test_intern: dict):
    """Verify searching across project name and description."""
    client.post(
        "/api/v1/projects",
        json={
            "name": "Authentication Module",
            "description": "OAuth and JWT system",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "NOT_STARTED",
        },
    )
    client.post(
        "/api/v1/projects",
        json={
            "name": "Payment Gateway",
            "description": "Stripe token authentication and billing",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "IN_PROGRESS",
        },
    )
    client.post(
        "/api/v1/projects",
        json={
            "name": "Notification Engine",
            "description": "Email alerts",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "NOT_STARTED",
        },
    )

    # Search for 'auth' -> matches Authentication Module (name) and Payment Gateway (description)
    res = client.get("/api/v1/projects?search=auth")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 2
    names = {r["name"] for r in results}
    assert names == {"Authentication Module", "Payment Gateway"}


def test_filter_projects_by_intern_id(
    client: TestClient, test_intern: dict, test_intern2: dict
):
    """Verify filtering projects by assigned intern_id."""
    client.post(
        "/api/v1/projects",
        json={
            "name": "Intern 1 Project",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
        },
    )
    client.post(
        "/api/v1/projects",
        json={
            "name": "Intern 2 Project",
            "intern_id": test_intern2["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
        },
    )

    res = client.get(f"/api/v1/projects?intern_id={test_intern['id']}")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["name"] == "Intern 1 Project"


def test_filter_projects_by_status(client: TestClient, test_intern: dict):
    """Verify filtering projects by workflow status."""
    client.post(
        "/api/v1/projects",
        json={
            "name": "Project A",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "IN_PROGRESS",
            "progress": 30,
        },
    )
    client.post(
        "/api/v1/projects",
        json={
            "name": "Project B",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
            "status": "COMPLETED",
            "progress": 100,
        },
    )

    res = client.get("/api/v1/projects?status=IN_PROGRESS")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["name"] == "Project A"


def test_delete_project_success(client: TestClient, test_intern: dict):
    """Verify deleting a project returns 204 No Content and removes record."""
    create_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Temporary Project",
            "intern_id": test_intern["id"],
            "start_date": "2026-06-15",
            "deadline": "2026-08-15",
        },
    )
    project_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/projects/{project_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 404


def test_delete_project_not_found(client: TestClient):
    """Verify deleting non-existent project returns 404."""
    response = client.delete("/api/v1/projects/99999")
    assert response.status_code == 404


def test_openapi_schema_contains_projects(client: TestClient):
    """Verify project endpoints are documented in OpenAPI schema."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]

    assert "/api/v1/projects" in paths
    assert "get" in paths["/api/v1/projects"]
    assert "post" in paths["/api/v1/projects"]
    assert "/api/v1/projects/{project_id}" in paths
    assert "get" in paths["/api/v1/projects/{project_id}"]
    assert "put" in paths["/api/v1/projects/{project_id}"]
    assert "delete" in paths["/api/v1/projects/{project_id}"]

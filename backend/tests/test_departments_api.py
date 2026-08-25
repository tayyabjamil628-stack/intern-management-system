import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
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


def test_list_departments_empty(client: TestClient):
    """Verify listing departments when none exist returns empty list."""
    response = client.get("/api/v1/departments")
    assert response.status_code == 200
    assert response.json() == []


def test_create_department_success(client: TestClient):
    """Verify creating a new department returns 201 and valid payload."""
    payload = {
        "name": "Engineering",
        "description": "Core software engineering and infrastructure",
    }
    response = client.post("/api/v1/departments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Engineering"
    assert data["description"] == "Core software engineering and infrastructure"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_department_duplicate_name_conflict(client: TestClient):
    """Verify creating a duplicate department name returns 409 Conflict."""
    payload = {"name": "Product Design", "description": "UI/UX design team"}
    res1 = client.post("/api/v1/departments", json=payload)
    assert res1.status_code == 201

    # Attempt to recreate with same name
    res2 = client.post("/api/v1/departments", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_create_department_whitespace_name_rejected(client: TestClient):
    """Verify whitespace-only department name is rejected with 422."""
    payload = {"name": "   ", "description": "Invalid department"}
    response = client.post("/api/v1/departments", json=payload)
    assert response.status_code == 422


def test_get_department_by_id_success(client: TestClient):
    """Verify retrieving a single department by its ID."""
    create_res = client.post(
        "/api/v1/departments",
        json={"name": "Data Science", "description": "ML and Analytics"},
    )
    dept_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/departments/{dept_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == dept_id
    assert data["name"] == "Data Science"
    assert data["description"] == "ML and Analytics"


def test_get_department_by_id_not_found(client: TestClient):
    """Verify non-existent department returns 404."""
    response = client.get("/api/v1/departments/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_department_success(client: TestClient):
    """Verify updating a department's name and description."""
    create_res = client.post(
        "/api/v1/departments",
        json={"name": "DevOps", "description": "Initial description"},
    )
    dept_id = create_res.json()["id"]

    update_payload = {
        "name": "Cloud Operations",
        "description": "Cloud infra and CI/CD pipelines",
    }
    put_res = client.put(f"/api/v1/departments/{dept_id}", json=update_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["id"] == dept_id
    assert data["name"] == "Cloud Operations"
    assert data["description"] == "Cloud infra and CI/CD pipelines"


def test_update_department_duplicate_name_conflict(client: TestClient):
    """Verify updating a department name to another existing name returns 409."""
    client.post("/api/v1/departments", json={"name": "Security"})
    dept2 = client.post("/api/v1/departments", json={"name": "Operations"}).json()

    # Attempt to rename Operations to Security
    res = client.put(f"/api/v1/departments/{dept2['id']}", json={"name": "Security"})
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"]


def test_delete_department_success(client: TestClient):
    """Verify deleting a department returns 204 and removes the record."""
    create_res = client.post(
        "/api/v1/departments",
        json={"name": "Temporary Dept", "description": "To be removed"},
    )
    dept_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/v1/departments/{dept_id}")
    assert del_res.status_code == 204

    # Verify subsequent GET returns 404
    get_res = client.get(f"/api/v1/departments/{dept_id}")
    assert get_res.status_code == 404


def test_delete_department_not_found(client: TestClient):
    """Verify deleting a non-existent department returns 404."""
    del_res = client.delete("/api/v1/departments/88888")
    assert del_res.status_code == 404


def test_search_departments(client: TestClient):
    """Verify search query parameter filters departments by name."""
    client.post("/api/v1/departments", json={"name": "Frontend Engineering"})
    client.post("/api/v1/departments", json={"name": "Backend Engineering"})
    client.post("/api/v1/departments", json={"name": "Human Resources"})

    res = client.get("/api/v1/departments?search=Engineering")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 2
    names = {r["name"] for r in results}
    assert names == {"Frontend Engineering", "Backend Engineering"}


def test_openapi_schema_contains_departments(client: TestClient):
    """Verify department endpoints are documented in OpenAPI schema."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]

    assert "/api/v1/departments" in paths
    assert "get" in paths["api/v1/departments" if "api/v1/departments" in paths else "/api/v1/departments"]
    assert "post" in paths["api/v1/departments" if "api/v1/departments" in paths else "/api/v1/departments"]
    assert "/api/v1/departments/{department_id}" in paths
    assert "get" in paths["/api/v1/departments/{department_id}"]
    assert "put" in paths["/api/v1/departments/{department_id}"]
    assert "delete" in paths["/api/v1/departments/{department_id}"]

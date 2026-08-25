import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
import app.models  # noqa: F401 - ensure all models loaded


# Set up isolated in-memory SQLite database for audit tests
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


# ---------------------------------------------------------
# 1. EMPTY COLLECTIONS AUDIT
# ---------------------------------------------------------

def test_empty_collections_return_empty_list(client: TestClient):
    """Verify all collection endpoints return 200 with [] when empty, not 404."""
    for endpoint in ["/api/v1/departments", "/api/v1/interns", "/api/v1/projects", "/api/v1/attendance"]:
        res = client.get(endpoint)
        assert res.status_code == 200
        assert res.json() == []


# ---------------------------------------------------------
# 2. STATUS CODES & 404 NOT FOUND AUDIT
# ---------------------------------------------------------

def test_consistent_404_not_found_responses(client: TestClient):
    """Verify all GET/PUT/DELETE for non-existent IDs return 404 with JSON detail."""
    non_existent_id = 99999
    endpoints = [
        f"/api/v1/departments/{non_existent_id}",
        f"/api/v1/interns/{non_existent_id}",
        f"/api/v1/projects/{non_existent_id}",
        f"/api/v1/attendance/{non_existent_id}",
    ]
    for ep in endpoints:
        # GET
        res_get = client.get(ep)
        assert res_get.status_code == 404
        assert "detail" in res_get.json()
        assert isinstance(res_get.json()["detail"], str)

        # PUT
        res_put = client.put(ep, json={})
        assert res_put.status_code == 404
        assert "detail" in res_put.json()

        # DELETE
        res_del = client.delete(ep)
        assert res_del.status_code == 404
        assert "detail" in res_del.json()


# ---------------------------------------------------------
# 3. 422 VALIDATION AUDIT
# ---------------------------------------------------------

def test_validation_rejects_invalid_inputs(client: TestClient):
    """Verify 422 Unprocessable Entity for schema constraint violations."""
    # Department whitespace-only name
    res = client.post("/api/v1/departments", json={"name": "   "})
    assert res.status_code == 422

    # Department name too long (> 100)
    res = client.post("/api/v1/departments", json={"name": "A" * 101})
    assert res.status_code == 422

    # Intern invalid email
    res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-001",
            "full_name": "Test User",
            "email": "not-an-email",
            "department_id": 1,
            "role": "Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    assert res.status_code == 422

    # Intern end_date < start_date
    res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-001",
            "full_name": "Test User",
            "email": "valid@example.com",
            "department_id": 1,
            "role": "Intern",
            "start_date": "2026-08-31",
            "end_date": "2026-06-01",
        },
    )
    assert res.status_code == 422

    # Project progress > 100
    res = client.post(
        "/api/v1/projects",
        json={
            "name": "Project Alpha",
            "intern_id": 1,
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "progress": 150,
        },
    )
    assert res.status_code == 422

    # Attendance remarks > 255
    res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": 1,
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
            "remarks": "X" * 256,
        },
    )
    assert res.status_code == 422


# ---------------------------------------------------------
# 4. 409 CONFLICT & INTEGRITY AUDIT
# ---------------------------------------------------------

def test_duplicate_conflicts_return_409(client: TestClient):
    """Verify duplicate constraints consistently return 409 Conflict with clean details."""
    # 1. Department duplicate name
    d1 = client.post("/api/v1/departments", json={"name": "Engineering"}).json()
    res_dup_dept = client.post("/api/v1/departments", json={"name": "Engineering"})
    assert res_dup_dept.status_code == 409
    assert "already exists" in res_dup_dept.json()["detail"]

    # 2. Intern duplicate intern_id and email
    i1 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-001",
            "full_name": "Alice",
            "email": "alice@example.com",
            "department_id": d1["id"],
            "role": "Engineer",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    # Duplicate intern_id
    res_dup_id = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-001",
            "full_name": "Bob",
            "email": "bob@example.com",
            "department_id": d1["id"],
            "role": "Engineer",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    assert res_dup_id.status_code == 409

    # Duplicate email
    res_dup_email = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-002",
            "full_name": "Bob",
            "email": "alice@example.com",
            "department_id": d1["id"],
            "role": "Engineer",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    assert res_dup_email.status_code == 409

    # 3. Attendance duplicate intern_id + date
    a1 = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": i1["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    assert a1.status_code == 201

    a_dup = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": i1["id"],
            "attendance_date": "2026-06-15",
            "status": "ABSENT",
        },
    )
    assert a_dup.status_code == 409
    assert "already recorded" in a_dup.json()["detail"]


# ---------------------------------------------------------
# 5. EFFECTIVE-VALUE UPDATE VALIDATION AUDIT
# ---------------------------------------------------------

def test_effective_value_update_validations(client: TestClient):
    """Verify that PUT updates validate effective combined values (not just explicit fields)."""
    # Set up Department and Intern
    d1 = client.post("/api/v1/departments", json={"name": "Engineering"}).json()
    intern = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-001",
            "full_name": "Alice Smith",
            "email": "alice@example.com",
            "department_id": d1["id"],
            "role": "Engineer",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    # Update intern start_date past existing end_date (2026-08-31)
    res_bad_start = client.put(
        f"/api/v1/interns/{intern['id']}",
        json={"start_date": "2026-09-15"},
    )
    assert res_bad_start.status_code == 422

    # Update intern with non-existent department
    res_bad_dept = client.put(
        f"/api/v1/interns/{intern['id']}",
        json={"department_id": 99999},
    )
    assert res_bad_dept.status_code == 404

    # Create project with start_date=2026-06-01, deadline=2026-08-31
    project = client.post(
        "/api/v1/projects",
        json={
            "name": "Audit Project",
            "intern_id": intern["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "status": "IN_PROGRESS",
            "progress": 50,
        },
    ).json()

    # Update project deadline earlier than existing start_date (2026-06-01)
    res_bad_deadline = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"deadline": "2026-05-15"},
    )
    assert res_bad_deadline.status_code == 422

    # Update project start_date later than existing deadline (2026-08-31)
    res_bad_start_proj = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"start_date": "2026-09-01"},
    )
    assert res_bad_start_proj.status_code == 422

    # Update project to COMPLETED normalizes progress to 100
    res_comp = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"status": "COMPLETED"},
    )
    assert res_comp.status_code == 200
    assert res_comp.json()["progress"] == 100


# ---------------------------------------------------------
# 6. COMBINED FILTERS & SEARCH AUDIT
# ---------------------------------------------------------

def test_combined_filters_across_endpoints(client: TestClient):
    """Verify filters and search parameters combine properly."""
    # Setup 2 departments
    d_eng = client.post("/api/v1/departments", json={"name": "Engineering"}).json()
    d_des = client.post("/api/v1/departments", json={"name": "Design"}).json()

    # Setup interns
    i1 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-001",
            "full_name": "Alice Walker",
            "email": "alice.w@example.com",
            "department_id": d_eng["id"],
            "role": "Frontend",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    ).json()
    i2 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-002",
            "full_name": "Bob Vance",
            "email": "bob.v@example.com",
            "department_id": d_des["id"],
            "role": "Designer",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "COMPLETED",
        },
    ).json()

    # Intern filter combined: department_id + status
    res = client.get(f"/api/v1/interns?department_id={d_eng['id']}&status=ACTIVE")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["id"] == i1["id"]

    # Intern filter no match: department_id + status
    res_empty = client.get(f"/api/v1/interns?department_id={d_eng['id']}&status=COMPLETED")
    assert res_empty.status_code == 200
    assert res_empty.json() == []

    # Search filter
    res_search = client.get("/api/v1/interns?search=vance")
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert res_search.json()[0]["id"] == i2["id"]


# ---------------------------------------------------------
# 7. OPENAPI SCHEMA AUDIT
# ---------------------------------------------------------

def test_openapi_schema_contains_all_four_resource_groups(client: TestClient):
    """Verify /openapi.json contains all 4 resources with correct operations."""
    res = client.get("/openapi.json")
    assert res.status_code == 200
    paths = res.json()["paths"]

    expected_routes = [
        "/api/v1/health",
        "/api/v1/departments",
        "/api/v1/departments/{department_id}",
        "/api/v1/interns",
        "/api/v1/interns/{intern_id}",
        "/api/v1/projects",
        "/api/v1/projects/{project_id}",
        "/api/v1/attendance",
        "/api/v1/attendance/{attendance_id}",
    ]
    for route in expected_routes:
        assert route in paths, f"Expected route '{route}' missing from OpenAPI paths"

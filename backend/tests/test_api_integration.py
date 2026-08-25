import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
import app.models  # noqa: F401 - ensure all models loaded


# Set up isolated in-memory SQLite database with foreign keys enabled
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable SQLite foreign key constraint enforcement."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


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
# 1. END-TO-END CREATION FLOW
# ---------------------------------------------------------

def test_end_to_end_creation_and_retrieval_flow(client: TestClient):
    """
    Test full creation sequence:
    1. Create Department
    2. Create Intern referencing Department
    3. Create Project referencing Intern
    4. Create Attendance referencing Intern
    5. Retrieve all resources and verify relationships
    """
    # 1. Create Department
    dept_res = client.post(
        "/api/v1/departments",
        json={"name": "Artificial Intelligence", "description": "AI & Research Division"},
    )
    assert dept_res.status_code == 201
    dept = dept_res.json()
    dept_id = dept["id"]

    # 2. Create Intern
    intern_res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-AI-001",
            "full_name": "Maya Lin",
            "email": "maya.lin@example.com",
            "department_id": dept_id,
            "role": "ML Engineer Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    assert intern_res.status_code == 201
    intern = intern_res.json()
    intern_id = intern["id"]

    # 3. Create Project
    project_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Neural Semantic Search",
            "description": "Building semantic search pipeline with embeddings",
            "intern_id": intern_id,
            "start_date": "2026-06-05",
            "deadline": "2026-08-20",
            "status": "IN_PROGRESS",
            "progress": 35,
        },
    )
    assert project_res.status_code == 201
    project = project_res.json()
    project_id = project["id"]

    # 4. Create Attendance
    att_res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": intern_id,
            "attendance_date": "2026-06-10",
            "status": "PRESENT",
            "remarks": "Attended morning standup and onboarding",
        },
    )
    assert att_res.status_code == 201
    attendance = att_res.json()
    att_id = attendance["id"]

    # 5. Retrieve all four resources and verify foreign keys
    get_dept = client.get(f"/api/v1/departments/{dept_id}").json()
    assert get_dept["id"] == dept_id
    assert get_dept["name"] == "Artificial Intelligence"

    get_intern = client.get(f"/api/v1/interns/{intern_id}").json()
    assert get_intern["id"] == intern_id
    assert get_intern["department_id"] == dept_id
    assert get_intern["intern_id"] == "INT-AI-001"

    get_proj = client.get(f"/api/v1/projects/{project_id}").json()
    assert get_proj["id"] == project_id
    assert get_proj["intern_id"] == intern_id
    assert get_proj["progress"] == 35

    get_att = client.get(f"/api/v1/attendance/{att_id}").json()
    assert get_att["id"] == att_id
    assert get_att["intern_id"] == intern_id
    assert get_att["status"] == "PRESENT"


# ---------------------------------------------------------
# 2. DEPARTMENT → INTERN DEPENDENCY VALIDATION
# ---------------------------------------------------------

def test_department_to_intern_dependency_validation(client: TestClient):
    """Verify intern creation enforces valid department foreign key."""
    # Attempt creation with non-existent department ID
    bad_res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-DEP-999",
            "full_name": "Ghost Intern",
            "email": "ghost@example.com",
            "department_id": 88888,
            "role": "Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    assert bad_res.status_code == 404
    assert "Department with ID 88888 not found" in bad_res.json()["detail"]

    # Create department, then create intern successfully
    dept = client.post("/api/v1/departments", json={"name": "Product Design"}).json()
    good_res = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-DES-001",
            "full_name": "Liam Scott",
            "email": "liam.scott@example.com",
            "department_id": dept["id"],
            "role": "UI/UX Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "status": "ACTIVE",
        },
    )
    assert good_res.status_code == 201
    assert good_res.json()["department_id"] == dept["id"]


# ---------------------------------------------------------
# 3. INTERN → PROJECT DEPENDENCY VALIDATION
# ---------------------------------------------------------

def test_intern_to_project_dependency_validation(client: TestClient):
    """Verify project creation enforces valid intern foreign key."""
    # Attempt creation with non-existent intern ID
    bad_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Orphan Project",
            "intern_id": 99999,
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "status": "NOT_STARTED",
        },
    )
    assert bad_res.status_code == 404
    assert "Intern with ID 99999 not found" in bad_res.json()["detail"]

    # Setup department & intern, then create project
    dept = client.post("/api/v1/departments", json={"name": "DevOps"}).json()
    intern = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-DO-001",
            "full_name": "Devon Ops",
            "email": "devon@example.com",
            "department_id": dept["id"],
            "role": "SRE Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    good_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Kubernetes Cluster Auto-scaler",
            "intern_id": intern["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "status": "IN_PROGRESS",
            "progress": 20,
        },
    )
    assert good_res.status_code == 201
    assert good_res.json()["intern_id"] == intern["id"]


# ---------------------------------------------------------
# 4. INTERN → ATTENDANCE DEPENDENCY VALIDATION
# ---------------------------------------------------------

def test_intern_to_attendance_dependency_validation(client: TestClient):
    """Verify attendance logging enforces valid intern foreign key."""
    # Attempt creation with non-existent intern ID
    bad_res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": 99999,
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    )
    assert bad_res.status_code == 404
    assert "Intern with ID 99999 not found" in bad_res.json()["detail"]

    # Setup valid intern
    dept = client.post("/api/v1/departments", json={"name": "QA"}).json()
    intern = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-QA-001",
            "full_name": "Quinn Adams",
            "email": "quinn@example.com",
            "department_id": dept["id"],
            "role": "QA Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    good_res = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
            "remarks": "Full day in office",
        },
    )
    assert good_res.status_code == 201
    assert good_res.json()["intern_id"] == intern["id"]


# ---------------------------------------------------------
# 5. DUPLICATE / CONFLICT RULES
# ---------------------------------------------------------

def test_integration_duplicate_conflicts(client: TestClient):
    """Verify 409 Conflict across departments, intern unique fields, and attendance logs."""
    dept = client.post("/api/v1/departments", json={"name": "Cloud Infrastructure"}).json()

    # 1. Duplicate Department name
    dup_dept = client.post("/api/v1/departments", json={"name": "Cloud Infrastructure"})
    assert dup_dept.status_code == 409

    # Setup intern 1
    i1 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-CI-001",
            "full_name": "Carlos Gomez",
            "email": "carlos@example.com",
            "department_id": dept["id"],
            "role": "Cloud Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    # 2. Duplicate intern_id
    dup_id = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-CI-001",
            "full_name": "Other Person",
            "email": "other@example.com",
            "department_id": dept["id"],
            "role": "Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    assert dup_id.status_code == 409

    # 3. Duplicate email
    dup_email = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-CI-002",
            "full_name": "Other Person",
            "email": "carlos@example.com",
            "department_id": dept["id"],
            "role": "Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    )
    assert dup_email.status_code == 409

    # 4. Duplicate attendance intern + date
    client.post(
        "/api/v1/attendance",
        json={
            "intern_id": i1["id"],
            "attendance_date": "2026-07-01",
            "status": "PRESENT",
        },
    )
    dup_att = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": i1["id"],
            "attendance_date": "2026-07-01",
            "status": "ABSENT",
        },
    )
    assert dup_att.status_code == 409
    assert "already recorded" in dup_att.json()["detail"]


# ---------------------------------------------------------
# 6. CROSS-RESOURCE FILTERING
# ---------------------------------------------------------

def test_cross_resource_filtering(client: TestClient):
    """Verify relational filters between departments, interns, projects, and attendance."""
    d1 = client.post("/api/v1/departments", json={"name": "Frontend"}).json()
    d2 = client.post("/api/v1/departments", json={"name": "Backend"}).json()

    # Interns across 2 departments
    i1 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-FE-001",
            "full_name": "Fiona Apple",
            "email": "fiona@example.com",
            "department_id": d1["id"],
            "role": "React Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    i2 = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-BE-001",
            "full_name": "Ben Folds",
            "email": "ben@example.com",
            "department_id": d2["id"],
            "role": "Node Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    # Filter interns by department
    res_d1_interns = client.get(f"/api/v1/interns?department_id={d1['id']}").json()
    assert len(res_d1_interns) == 1
    assert res_d1_interns[0]["id"] == i1["id"]

    res_d2_interns = client.get(f"/api/v1/interns?department_id={d2['id']}").json()
    assert len(res_d2_interns) == 1
    assert res_d2_interns[0]["id"] == i2["id"]

    # Projects across interns
    p1 = client.post(
        "/api/v1/projects",
        json={
            "name": "Design System",
            "intern_id": i1["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "status": "IN_PROGRESS",
        },
    ).json()
    p2 = client.post(
        "/api/v1/projects",
        json={
            "name": "Auth Service",
            "intern_id": i2["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "status": "IN_PROGRESS",
        },
    ).json()

    res_i1_projs = client.get(f"/api/v1/projects?intern_id={i1['id']}").json()
    assert len(res_i1_projs) == 1
    assert res_i1_projs[0]["id"] == p1["id"]

    # Attendance logs across interns
    client.post(
        "/api/v1/attendance",
        json={"intern_id": i1["id"], "attendance_date": "2026-06-15", "status": "PRESENT"},
    )
    client.post(
        "/api/v1/attendance",
        json={"intern_id": i2["id"], "attendance_date": "2026-06-15", "status": "LEAVE"},
    )

    res_i1_att = client.get(f"/api/v1/attendance?intern_id={i1['id']}").json()
    assert len(res_i1_att) == 1
    assert res_i1_att[0]["status"] == "PRESENT"


# ---------------------------------------------------------
# 7. UPDATE CHAIN & DEPENDENT UPDATES
# ---------------------------------------------------------

def test_update_chain_and_dependent_validations(client: TestClient):
    """Verify partial updates and dependent entity validations across all resources."""
    d1 = client.post("/api/v1/departments", json={"name": "Data Science"}).json()
    d2 = client.post("/api/v1/departments", json={"name": "Data Engineering"}).json()

    intern = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-DS-001",
            "full_name": "Daniel Smith",
            "email": "daniel@example.com",
            "department_id": d1["id"],
            "role": "Analyst Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    project = client.post(
        "/api/v1/projects",
        json={
            "name": "Churn Prediction",
            "intern_id": intern["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
            "status": "NOT_STARTED",
            "progress": 0,
        },
    ).json()

    att = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    ).json()

    # 1. Update Department
    up_dept = client.put(
        f"/api/v1/departments/{d1['id']}",
        json={"description": "Updated Division Description"},
    ).json()
    assert up_dept["description"] == "Updated Division Description"

    # 2. Update Intern (change department to valid d2)
    up_intern = client.put(
        f"/api/v1/interns/{intern['id']}",
        json={"department_id": d2["id"], "role": "Senior Analyst Intern"},
    ).json()
    assert up_intern["department_id"] == d2["id"]
    assert up_intern["role"] == "Senior Analyst Intern"

    # Update Intern with invalid department returns 404
    bad_up_intern = client.put(
        f"/api/v1/interns/{intern['id']}",
        json={"department_id": 99999},
    )
    assert bad_up_intern.status_code == 404

    # 3. Update Project
    up_proj = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"status": "COMPLETED"},
    ).json()
    assert up_proj["status"] == "COMPLETED"
    assert up_proj["progress"] == 100

    # 4. Update Attendance
    up_att = client.put(
        f"/api/v1/attendance/{att['id']}",
        json={"remarks": "Updated remark after review"},
    ).json()
    assert up_att["remarks"] == "Updated remark after review"


# ---------------------------------------------------------
# 8. REFERENTIAL INTEGRITY & DELETE PROTECTION
# ---------------------------------------------------------

def test_referential_integrity_delete_protection(client: TestClient):
    """
    Verify ON DELETE RESTRICT behavior:
    - Attempting to delete an intern that has associated projects or attendance records
      returns 409 Conflict and preserves database integrity.
    - Attempting to delete a department with assigned interns returns 409 Conflict.
    """
    dept = client.post("/api/v1/departments", json={"name": "Security"}).json()
    intern = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-SEC-001",
            "full_name": "Sam Sec",
            "email": "sam.sec@example.com",
            "department_id": dept["id"],
            "role": "AppSec Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()

    project = client.post(
        "/api/v1/projects",
        json={
            "name": "Vulnerability Scanner",
            "intern_id": intern["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
        },
    ).json()

    att = client.post(
        "/api/v1/attendance",
        json={
            "intern_id": intern["id"],
            "attendance_date": "2026-06-15",
            "status": "PRESENT",
        },
    ).json()

    # Attempt to delete intern while project and attendance exist
    del_intern_res = client.delete(f"/api/v1/interns/{intern['id']}")
    assert del_intern_res.status_code == 409
    assert "associated projects or attendance records exist" in del_intern_res.json()["detail"]

    # Verify intern still exists
    get_intern = client.get(f"/api/v1/interns/{intern['id']}")
    assert get_intern.status_code == 200

    # Attempt to delete department while intern exists
    del_dept_res = client.delete(f"/api/v1/departments/{dept['id']}")
    assert del_dept_res.status_code == 409
    assert "assigned interns or dependencies" in del_dept_res.json()["detail"]

    # Verify department still exists
    get_dept = client.get(f"/api/v1/departments/{dept['id']}")
    assert get_dept.status_code == 200


# ---------------------------------------------------------
# 9. DELETE CLEANUP FLOW (IN REVERSE DEPENDENCY ORDER)
# ---------------------------------------------------------

def test_delete_cleanup_flow_in_reverse_order(client: TestClient):
    """
    Verify complete cleanup flow in proper dependency order:
    1. Delete Attendance (204)
    2. Delete Project (204)
    3. Delete Intern (204)
    4. Delete Department (204)
    5. Verify all are 404
    """
    dept = client.post("/api/v1/departments", json={"name": "Temporary Dept"}).json()
    intern = client.post(
        "/api/v1/interns",
        json={
            "intern_id": "INT-TEMP-001",
            "full_name": "Temp Intern",
            "email": "temp@example.com",
            "department_id": dept["id"],
            "role": "Temp Intern",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
        },
    ).json()
    project = client.post(
        "/api/v1/projects",
        json={
            "name": "Temp Project",
            "intern_id": intern["id"],
            "start_date": "2026-06-01",
            "deadline": "2026-08-31",
        },
    ).json()
    att = client.post(
        "/api/v1/attendance",
        json={"intern_id": intern["id"], "attendance_date": "2026-06-15", "status": "PRESENT"},
    ).json()

    # Step 1: Delete attendance
    assert client.delete(f"/api/v1/attendance/{att['id']}").status_code == 204
    assert client.get(f"/api/v1/attendance/{att['id']}").status_code == 404

    # Step 2: Delete project
    assert client.delete(f"/api/v1/projects/{project['id']}").status_code == 204
    assert client.get(f"/api/v1/projects/{project['id']}").status_code == 404

    # Step 3: Delete intern (now that dependents are removed)
    assert client.delete(f"/api/v1/interns/{intern['id']}").status_code == 204
    assert client.get(f"/api/v1/interns/{intern['id']}").status_code == 404

    # Step 4: Delete department (now that intern is removed)
    assert client.delete(f"/api/v1/departments/{dept['id']}").status_code == 204
    assert client.get(f"/api/v1/departments/{dept['id']}").status_code == 404


# ---------------------------------------------------------
# 10. ERROR LEAKAGE AUDIT
# ---------------------------------------------------------

def test_error_responses_do_not_leak_internal_information(client: TestClient):
    """
    Verify error responses return clean JSON and do not leak:
    - Raw SQL strings (SELECT, INSERT, UPDATE, table definitions)
    - Database passwords or connection strings
    - Internal traceback/filesystem paths
    """
    # 404 Error
    res_404 = client.get("/api/v1/interns/99999")
    detail_404 = str(res_404.json().get("detail", ""))
    assert "Traceback" not in detail_404
    assert "SELECT" not in detail_404
    assert "mysql://" not in detail_404
    assert ".py" not in detail_404

    # 422 Error
    res_422 = client.post("/api/v1/departments", json={"name": ""})
    detail_422 = str(res_422.json().get("detail", ""))
    assert "Traceback" not in detail_422
    assert "mysql://" not in detail_422

    # 409 Error
    client.post("/api/v1/departments", json={"name": "UniqueDept"})
    res_409 = client.post("/api/v1/departments", json={"name": "UniqueDept"})
    detail_409 = str(res_409.json().get("detail", ""))
    assert "Traceback" not in detail_409
    assert "INSERT INTO" not in detail_409
    assert "mysql://" not in detail_409

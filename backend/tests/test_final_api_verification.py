from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_openapi_full_inventory():
    """Verify all 21 resource endpoints + health are in OpenAPI schema with correct tags."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    paths = schema["paths"]

    # 1. Health
    assert "/api/v1/health" in paths
    assert "get" in paths["/api/v1/health"]
    assert "Health" in paths["/api/v1/health"]["get"]["tags"]

    # 2. Departments (5 endpoints)
    assert "/api/v1/departments" in paths
    assert "get" in paths["/api/v1/departments"]
    assert "post" in paths["/api/v1/departments"]
    assert "Departments" in paths["/api/v1/departments"]["get"]["tags"]
    assert "Departments" in paths["/api/v1/departments"]["post"]["tags"]

    assert "/api/v1/departments/{department_id}" in paths
    assert "get" in paths["/api/v1/departments/{department_id}"]
    assert "put" in paths["/api/v1/departments/{department_id}"]
    assert "delete" in paths["/api/v1/departments/{department_id}"]
    assert "Departments" in paths["/api/v1/departments/{department_id}"]["get"]["tags"]

    # 3. Interns (5 endpoints)
    assert "/api/v1/interns" in paths
    assert "get" in paths["/api/v1/interns"]
    assert "post" in paths["/api/v1/interns"]
    assert "Interns" in paths["/api/v1/interns"]["get"]["tags"]
    assert "Interns" in paths["/api/v1/interns"]["post"]["tags"]

    assert "/api/v1/interns/{intern_id}" in paths
    assert "get" in paths["/api/v1/interns/{intern_id}"]
    assert "put" in paths["/api/v1/interns/{intern_id}"]
    assert "delete" in paths["/api/v1/interns/{intern_id}"]
    assert "Interns" in paths["/api/v1/interns/{intern_id}"]["get"]["tags"]

    # 4. Projects (5 endpoints)
    assert "/api/v1/projects" in paths
    assert "get" in paths["/api/v1/projects"]
    assert "post" in paths["/api/v1/projects"]
    assert "Projects" in paths["/api/v1/projects"]["get"]["tags"]
    assert "Projects" in paths["/api/v1/projects"]["post"]["tags"]

    assert "/api/v1/projects/{project_id}" in paths
    assert "get" in paths["/api/v1/projects/{project_id}"]
    assert "put" in paths["/api/v1/projects/{project_id}"]
    assert "delete" in paths["/api/v1/projects/{project_id}"]
    assert "Projects" in paths["/api/v1/projects/{project_id}"]["get"]["tags"]

    # 5. Attendance (5 endpoints)
    assert "/api/v1/attendance" in paths
    assert "get" in paths["/api/v1/attendance"]
    assert "post" in paths["/api/v1/attendance"]
    assert "Attendance" in paths["/api/v1/attendance"]["get"]["tags"]
    assert "Attendance" in paths["/api/v1/attendance"]["post"]["tags"]

    assert "/api/v1/attendance/{attendance_id}" in paths
    assert "get" in paths["/api/v1/attendance/{attendance_id}"]
    assert "put" in paths["/api/v1/attendance/{attendance_id}"]
    assert "delete" in paths["/api/v1/attendance/{attendance_id}"]
    assert "Attendance" in paths["/api/v1/attendance/{attendance_id}"]["get"]["tags"]


def test_server_docs_and_redoc_endpoints():
    """Verify OpenAPI and documentation endpoints are accessible."""
    assert client.get("/").status_code == 200
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
    assert client.get("/openapi.json").status_code == 200
    assert client.get("/api/v1/health").status_code == 200

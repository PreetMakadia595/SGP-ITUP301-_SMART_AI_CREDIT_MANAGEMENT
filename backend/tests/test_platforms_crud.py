"""
Unit tests for AI Platform CRUD APIs (/api/v1/platforms)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.platform import UserPlatform
from app.core.security import hash_password, create_access_token

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create test user
    user = User(
        email="testuser@example.com",
        hashed_password=hash_password("Secret123!"),
        full_name="Test User",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def get_auth_headers():
    db = TestingSessionLocal()
    user = db.query(User).filter_by(email="testuser@example.com").first()
    token = create_access_token({"sub": str(user.id)})
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_get_supported_platforms():
    res = client.get("/api/v1/platforms/supported")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    names = [p["name"] for p in data]
    expected_services = ["ChatGPT", "Claude", "Gemini", "Cursor", "GitHub Copilot", "Perplexity", "Lovable", "Bolt"]
    for service in expected_services:
        assert service in names


def test_create_and_read_platform():
    headers = get_auth_headers()
    payload = {
        "platform_name": "ChatGPT",
        "subscription_plan": "Plus",
        "monthly_cost": 20.0,
        "renewal_date": "2026-09-01",
        "status": "Active",
        "notes": "Primary work model",
        "api_key": "sk-test-12345",
    }
    
    # Create
    create_res = client.post("/api/v1/platforms", json=payload, headers=headers)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["platform_name"] == "ChatGPT"
    assert created["monthly_cost"] == 20.0
    assert created["status"] == "Active"
    assert created["masked_api_key"] is not None
    assert "2345" in created["masked_api_key"]

    platform_id = created["id"]

    # Read All
    list_res = client.get("/api/v1/platforms", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1

    # Read Single
    single_res = client.get(f"/api/v1/platforms/{platform_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["platform_name"] == "ChatGPT"


def test_update_and_delete_platform():
    headers = get_auth_headers()
    # Create initial
    create_res = client.post(
        "/api/v1/platforms",
        json={
            "platform_name": "Claude",
            "subscription_plan": "Pro",
            "monthly_cost": 20.0,
            "renewal_date": "2026-09-05",
            "status": "Active",
            "notes": "Anthropic AI",
        },
        headers=headers,
    )
    platform_id = create_res.json()["id"]

    # Update
    update_res = client.put(
        f"/api/v1/platforms/{platform_id}",
        json={
            "subscription_plan": "Team",
            "monthly_cost": 30.0,
            "status": "Inactive",
            "notes": "Paused subscription",
        },
        headers=headers,
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["subscription_plan"] == "Team"
    assert updated["monthly_cost"] == 30.0
    assert updated["status"] == "Inactive"
    assert updated["notes"] == "Paused subscription"

    # Search & Filter
    active_res = client.get("/api/v1/platforms?status_filter=Active", headers=headers)
    assert len(active_res.json()) == 0

    inactive_res = client.get("/api/v1/platforms?status_filter=Inactive", headers=headers)
    assert len(inactive_res.json()) == 1

    search_res = client.get("/api/v1/platforms?search=Paused", headers=headers)
    assert len(search_res.json()) == 1

    # Delete
    del_res = client.delete(f"/api/v1/platforms/{platform_id}", headers=headers)
    assert del_res.status_code == 200

    get_del = client.get(f"/api/v1/platforms/{platform_id}", headers=headers)
    assert get_del.status_code == 404

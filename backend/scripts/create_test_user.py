"""Create a test user for local development."""
from app.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

user = db.query(User).filter(User.email == "test@test.com").first()
if not user:
    user = User(
        email="test@test.com",
        hashed_password=pwd_ctx.hash("Test@1234"),
        full_name="Test User",
        is_active=True,
    )
    db.add(user)
    db.commit()
    print("Created user: test@test.com / Test@1234")
else:
    user.hashed_password = pwd_ctx.hash("Test@1234")
    db.commit()
    print("Reset password for test@test.com to Test@1234")

db.close()

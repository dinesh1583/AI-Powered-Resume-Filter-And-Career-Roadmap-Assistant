from core.security import verify_password, get_password_hash

plain_password = "MySecurePassword123!"
hashed = get_password_hash(plain_password)
print(f"Hashed: {hashed}")

is_valid = verify_password(plain_password, hashed)
print(f"Is valid: {is_valid}")

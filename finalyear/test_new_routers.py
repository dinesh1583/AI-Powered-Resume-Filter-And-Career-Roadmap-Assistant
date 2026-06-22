from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_routes():
    print("Testing /trends/summary...")
    response = client.get("/trends/summary")
    assert response.status_code == 200
    print("[SUCCESS] Trends Summary OK")

    print("Testing /salary/options...")
    response = client.get("/salary/options")
    assert response.status_code == 200
    print("[SUCCESS] Salary Options OK")

    print("Testing /creator/niches...")
    response = client.get("/creator/niches")
    assert response.status_code == 200
    print("[SUCCESS] Creator Niches OK")

    print("Testing /chat/suggestions...")
    response = client.get("/chat/suggestions")
    assert response.status_code in [200, 401] # 401 is fine if it requires auth
    print("[SUCCESS] Chat Suggestions OK")

if __name__ == "__main__":
    test_routes()
    print("All backend route checks passed.")

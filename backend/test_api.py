import requests  # Not from flask

class TestAPI:
    BASE_URL = "http://localhost:5001"
    
    def test_chat_endpoint(self):
        response = requests.post(
            f"{self.BASE_URL}/api/chat",
            json={"message": "Test message"}
        )
        assert response.status_code == 200

def test_history_endpoint():
    url = 'http://localhost:5000/api/chat/history'
    
    response = requests.get(url)
    print('Status:', response.status_code)
    print('History:', response.json())

if __name__ == '__main__':
    test_chat_endpoint()
    test_history_endpoint() 
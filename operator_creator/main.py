import requests 
import random
import os 
import string
from dotenv import load_dotenv

load_dotenv()

bearer_token = os.getenv("BEARER_TOKEN")
SITE_ID = "e5a4e380-ec89-41d9-a3d2-5a385b0a4aed"


NAMES = [
    "Santiago", "Emma", "Mateo", "Olivia", "Sebastian",
    "Liam", "Leonardo", "Sophia", "Diego", "Noah",
    "Emiliano", "Isabella", "Daniel", "Mia", "Alexander",
    "Valentina", "James", "Ximena", "Benjamin", "Camila",
    "Ethan", "Sofia", "Gabriel", "Charlotte", "Javier"
]
LAST_NAMES = [
    "Garcia", "Miller", "Hernandez", "Smith", "Rodriguez", 
    "Williams", "Martinez", "Johnson", "Lopez", "Brown",
    "Gonzalez", "Jones", "Perez", "Davis", "Sanchez", 
    "Wilson", "Ramirez", "Anderson", "Cruz", "Taylor"
]
EXTENSION = "@cebank.com"

ROLES = ["operator", "manager", "super_manager"]
ROLES_WEIGHTS = [0.7, 0.2, 0.1]

HEADERS = {
    "accept": "application/vnd.salemove.v1+json",
    "content-type": "application/json",
    "authorization": f"Bearer {bearer_token}"
}


def generate_password(length=12):
    # 1. Define specific pools
    upper = string.ascii_uppercase
    lower = string.ascii_lowercase
    special = "!@#$%^&*"
    all_chars = string.ascii_letters + string.digits + special
    
    # 2. Guarantee at least one of each required type
    password_list = [
        random.choice(upper),
        random.choice(special),
        random.choice(string.digits),
        random.choice(lower)
    ]
    
    # 3. Fill the remaining length (length - 4) with random choices from the full pool
    password_list += [random.choice(all_chars) for _ in range(length - 4)]
    
    # 4. Shuffle the list so the guaranteed chars aren't always at the start
    random.shuffle(password_list)
    
    return ''.join(password_list)


def generate_payload():
    name = random.choice(NAMES)
    lastName = random.choice(LAST_NAMES)

    email = name + "_" + lastName + EXTENSION
    full_name = name + " " + lastName

    role = random.choices(ROLES, weights=ROLES_WEIGHTS, k=1)[0]

    password = generate_password()

    return [full_name, email, role, password]



def create_operator(url, payload, headers):
    response = requests.post(url, json=payload, headers=headers)
    return response.text


def run():
    url = "https://api.glia.com/operators"

    for _ in range(50):

        data = generate_payload()

        payload = {
            "name" : data[0],
            "email" : data[1],
            "role" : data[2], 
            "password" : data[3],
            "password_confirmation" : data[3],
            "assignments" : [{"site_id": SITE_ID}]
        }

        response = create_operator(url=url, payload=payload, headers=HEADERS)
        
        print(response)







if __name__ == "__main__":
    run()

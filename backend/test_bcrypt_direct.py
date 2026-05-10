import bcrypt

hashed = b"$2b$12$HvpcOhSIDz11ZtGBTkBTD.20taixboLVW4XZnC1t2VjXdzPgZfoeS"
password = b"admin123"

try:
    if bcrypt.checkpw(password, hashed):
        print("Bcrypt direct: Match!")
    else:
        print("Bcrypt direct: No match")
except Exception as e:
    print(f"Bcrypt direct error: {e}")

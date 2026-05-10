import qrcode
import uuid


def generate_qr_code(data: str):
    token = str(uuid.uuid4())
    img = qrcode.make(data + "|" + token)
    filename = f"static/qr/{token}.png"
    img.save(filename)
    return filename

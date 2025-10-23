from flask import Blueprint, request, send_file, jsonify, url_for
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor
from datetime import datetime
import io, os, requests, qrcode, uuid

# Create a Flask Blueprint
pdf_blueprint = Blueprint('pdf_blueprint', __name__)

@pdf_blueprint.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.json

        # Create folders if they don't exist
        os.makedirs("static/orders", exist_ok=True)

        # Generate a unique order ID
        order_id = str(uuid.uuid4())[:8].upper()
        order_filename = f"sikars_order_{order_id}.pdf"
        order_path = os.path.join("static/orders", order_filename)

        # Generate QR code (tracking or order link)
        qr_link = f"https://sikars.com/orders/{order_id}"
        qr_img = qrcode.make(qr_link)
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_reader = ImageReader(qr_buffer)

        # --- PDF setup ---
        pdf_buffer = io.BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=letter)
        width, height = letter
        margin = 60
        y = height - margin

        # --- Brand header ---
        logo_path = "static/images/sikars_logo.png"
        if os.path.exists(logo_path):
            logo = ImageReader(logo_path)
            c.drawImage(logo, margin, y - 40, width=100, height=40, mask="auto")

        c.setFont("Helvetica-Bold", 22)
        c.setFillColor(HexColor("#6a4f3a"))
        c.drawString(margin + 120, y - 10, "Sikars Custom Cigar Order Summary")

        y -= 70
        c.setStrokeColor(HexColor("#d4af37"))
        c.setLineWidth(2)
        c.line(margin, y, width - margin, y)
        y -= 20

        # --- Order Info ---
        c.setFont("Helvetica", 11)
        c.setFillColor(HexColor("#1f1a17"))
        c.drawString(margin, y, f"Order ID: {order_id}")
        y -= 20
        c.drawString(margin, y, f"Order Date: {datetime.now().strftime('%B %d, %Y, %I:%M %p')}")
        y -= 25

        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(HexColor("#6a4f3a"))
        c.drawString(margin, y, "Order Details:")
        y -= 20

        c.setFont("Helvetica", 11)
        c.setFillColor(HexColor("#1f1a17"))
        details = [
            ("Cigar Size", data.get("size")),
            ("Box Style", data.get("box")),
            ("Binder", data.get("binder")),
            ("Flavor", data.get("flavor")),
            ("Engraving", data.get("engraving")),
            ("Band Text", data.get("bandText")),
            ("Quantity", data.get("quantity"))
        ]

        for label, value in details:
            c.drawString(margin, y, f"{label}: {value}")
            y -= 18

        # --- Image Section ---
        y -= 20
        c.setStrokeColor(HexColor("#d4af37"))
        c.line(margin, y, width - margin, y)
        y -= 30

        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(HexColor("#6a4f3a"))
        c.drawString(margin, y, "Preview Render:")
        y -= 10

        image_url = data.get("imageUrl")
        if image_url:
            try:
                img_bytes = requests.get(image_url, timeout=10).content
                img = ImageReader(io.BytesIO(img_bytes))
                img_height = 250
                c.drawImage(img, margin, y - img_height, width=300, height=img_height,
                            preserveAspectRatio=True, mask="auto")
                y -= img_height + 20
            except Exception as e:
                y -= 20
                c.setFont("Helvetica-Oblique", 10)
                c.setFillColor(HexColor("#b00020"))
                c.drawString(margin, y, f"Image could not be loaded: {e}")
                y -= 20
        else:
            c.setFont("Helvetica-Oblique", 10)
            c.setFillColor(HexColor("#b00020"))
            c.drawString(margin, y, "No preview image available.")
            y -= 20

        # --- QR Code (bottom-right corner) ---
        qr_size = 100
        c.drawImage(qr_reader, width - margin - qr_size, 100, width=qr_size, height=qr_size, mask="auto")

        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#1f1a17"))
        c.drawRightString(width - margin - 5, 95, f"Track Order: {qr_link}")

        # --- Footer ---
        c.setStrokeColor(HexColor("#d4af37"))
        c.line(margin, 80, width - margin, 80)
        c.setFont("Helvetica", 10)
        c.setFillColor(HexColor("#6a4f3a"))
        c.drawCentredString(width / 2, 65, "© 2025 Sikars.com — The Custom Cigar Experience")

        c.showPage()
        c.save()
        pdf_buffer.seek(0)

        # Save a copy for records
        with open(order_path, "wb") as f:
            f.write(pdf_buffer.getbuffer())

        # Reset buffer for sending
        pdf_buffer.seek(0)

        # Return both download and tracking info
        public_pdf_url = f"/static/orders/{order_filename}"

        return jsonify({
            "orderId": order_id,
            "downloadUrl": public_pdf_url,
            "trackingUrl": qr_link
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

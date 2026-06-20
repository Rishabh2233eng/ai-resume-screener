from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import razorpay
import os
from dotenv import load_dotenv
from app.database import get_db
from app.auth import get_current_user
from app import models

load_dotenv()

router = APIRouter()

client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

PREMIUM_PRICE_PAISE = 9900  # ₹99 in paise (Razorpay uses smallest currency unit)

@router.post("/create-order")
def create_order(current_user=Depends(get_current_user)):
    order = client.order.create({
        "amount": PREMIUM_PRICE_PAISE,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "user_id": str(current_user.id),
            "user_email": current_user.email
        }
    })
    return {
        "order_id": order["id"],
        "amount": PREMIUM_PRICE_PAISE,
        "currency": "INR",
        "key_id": os.getenv("RAZORPAY_KEY_ID")
    }

@router.post("/verify-payment")
def verify_payment(
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload["razorpay_order_id"],
            "razorpay_payment_id": payload["razorpay_payment_id"],
            "razorpay_signature": payload["razorpay_signature"]
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # Mark user as premium
    current_user.is_premium = True
    db.commit()

    return {"status": "success", "message": "You are now a Premium member!"}
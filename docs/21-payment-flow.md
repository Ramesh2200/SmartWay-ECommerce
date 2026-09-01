# 21. Payment Flow (Razorpay Gateway & COD)

- **Razorpay API Key**: `rzp_test_TSA8hQOJIQaDo0`
- **SDK**: Standard Razorpay Checkout JS modal.
- **Payment Options**: Instant UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery.
- **Verification**: Captures `razorpay_payment_id` upon payment authorization and updates order status to `PAID`.

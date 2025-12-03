// src/app/api/verify-payment/route.js
// This will be used in production to verify Paystack payments on the backend

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { reference, userId } = body;

    if (!reference || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!rateLimit(userId, 10, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.warn("PAYSTACK_SECRET_KEY not set. Using mock verification.");
      // For development/testing without backend
      return NextResponse.json(
        {
          verified: true,
          message: "Mock verification (development mode)",
          data: {
            reference,
            status: "success",
            amount: 0,
          },
        },
        { status: 200 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Payment verification failed", details: data },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not successful", status: data.data.status },
        { status: 400 }
      );
    }

    // Return verification result
    return NextResponse.json(
      {
        verified: true,
        data: {
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert from kobo to naira
          currency: data.data.currency,
          channel: data.data.channel,
          paidAt: data.data.paid_at,
          metadata: data.data.metadata,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

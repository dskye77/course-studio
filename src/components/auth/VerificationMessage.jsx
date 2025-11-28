import React from "react";

export default function VerificationMessage({ email }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Verification Email Sent!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-4">
          We’ve sent a verification link to <strong>{email}</strong>.
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-6">
          Please check your inbox and your spam folder, then click the link to
          verify your account before logging in.
        </p>
        <a
          href="/login"
          className="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

"use client";

interface PaymentActionsProps {
  phone: string;
}

export default function PaymentActions({ phone }: PaymentActionsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <button 
      onClick={() => copyToClipboard(phone)}
      className="btn-secondary"
    >
      Copy Phone Number
    </button>
  );
}

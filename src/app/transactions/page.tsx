"use client";

import { useState, useEffect } from "react";

import api from "@/lib/axios";

import type { ITransactionDocument } from "@/types/transaction";

interface ApiResponse {
  success: boolean;
  data?: ITransactionDocument[] | ITransactionDocument;
  error?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransactionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTransactionName, setNewTransactionName] = useState("");
  const [newTransactionAmount, setNewTransactionAmount] = useState<number>(0);
  const [newTransactionType, setNewTransactionType] = useState<
    "income" | "expense"
  >("expense");

  const resetForm = () => {
    setNewTransactionName("");
    setNewTransactionAmount(0);
    setNewTransactionType("expense");
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse>("/transactions");

      if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
      } else {
        setError(res.data.error || "Failed to fetch transactions.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !newTransactionName ||
      !newTransactionType ||
      newTransactionAmount <= 0
    ) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      const res = await api.post<ApiResponse>("/transactions", {
        name: newTransactionName,
        type: newTransactionType,
        amount: newTransactionAmount,
      });

      const data = res.data;
      if (data.success && data.data && !Array.isArray(data.data)) {
        setTransactions((prev) => [data.data as ITransactionDocument, ...prev]);
        resetForm();
      } else {
        setError(data.error || "Failed to create transaction.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Network error");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Transactions (Client Component)
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create New Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={newTransactionName}
              onChange={(e) => setNewTransactionName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={newTransactionAmount}
              onChange={(e) =>
                setNewTransactionAmount(parseFloat(e.target.value))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <select
              id="type"
              value={newTransactionType}
              onChange={(e) =>
                setNewTransactionType(e.target.value as "income" | "expense")
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700"
          >
            Add Transaction
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">All Transactions List</h2>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <ul className="list-disc pl-5">
            {transactions.map((tx) => (
              <li key={tx._id.toString()}>
                {tx.name} ({tx.type}): ${tx.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions found.</p>
        )}
      </section>
    </div>
  );
}

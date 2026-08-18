"use client";

import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-primary px-4 py-5 flex items-center justify-center">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute left-4 text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-white text-lg font-semibold">About</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="aspect-square rounded-3xl overflow-hidden shadow-sm">
            <img
              src="/keto-plate.jpg"
              alt="A ketogenic meal with salmon, egg, avocado, and greens"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">About the Ketogenic Diet</h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-primary" />

            <p className="mt-5 text-gray-700 leading-relaxed">
              The ketogenic diet is a low carbohydrate, high fat eating approach that can
              offer a simple and structured way to make{" "}
              <span className="text-primary font-medium">healthier food choices.</span>
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              It focuses on foods such as proteins, healthy fats and low carbohydrate
              vegetables, helping you build satisfying meals while{" "}
              <span className="text-primary font-medium">
                staying focused on your dietary goals.
              </span>
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 divide-y divide-gray-200">
          <div className="py-6">
            <h3 className="text-xl font-bold text-primary">Potential Benefits</h3>
            <p className="mt-2 text-gray-700 leading-relaxed">
              The ketogenic diet may help some people with weight management and appetite
              control. It may also support steady energy and better focus for daily
              activities.
            </p>
          </div>

          <div className="py-6">
            <h3 className="text-xl font-bold text-primary">A Structured Approach</h3>
            <p className="mt-2 text-gray-700 leading-relaxed">
              It provides a clear and practical way to reduce carbohydrate intake and
              choose foods that support your goals.
            </p>
          </div>

          <div className="py-6">
            <h3 className="text-xl font-bold text-primary">Sustainable Choices</h3>
            <p className="mt-2 text-gray-700 leading-relaxed">
              It is not about perfection. Small, consistent choices can lead to big,
              positive changes over time.
            </p>
          </div>
        </div>

        {/* Important callout */}
        <div className="mt-2 bg-primary-light rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary-dark">Important</h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            The ketogenic diet may not be suitable for everyone. Users with medical
            conditions or specific dietary needs should seek advice from a qualified
            healthcare professional before making major dietary changes.
          </p>
        </div>

        {/* Motivational message */}
        <div className="mt-10 flex flex-col items-center text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          <p className="mt-3 font-bold text-gray-900">
            You are one step closer to a healthier you.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Stay motivated. Stay consistent. You&apos;ve got this!
          </p>
        </div>
      </div>
    </main>
  );
}

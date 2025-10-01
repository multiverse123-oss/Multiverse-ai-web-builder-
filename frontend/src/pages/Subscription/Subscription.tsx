import React from 'react';

const Subscription: React.FC = () => {
  const plans = [
    { name: 'Basic', price: 20, prompts: 50 },
    { name: 'Standard', price: 35, prompts: 200 },
    { name: 'Premium', price: 50, prompts: 1000 }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="border border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2">${plan.price}/month</p>
            <p className="mt-2">{plan.prompts} prompts per day</p>
            <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;

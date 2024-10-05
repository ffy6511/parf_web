import React, { useState } from 'react';
import { api } from "~/utils/api";

const GreetingForm = () => {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const greetMutation = api.greeting.greet.useMutation({
    onSuccess: (data) => setGreeting(data.greeting),
    onError: (error) => setGreeting(`Error: ${error.message}`),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    greetMutation.mutate({ name });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button type="submit" disabled={greetMutation.isLoading}>
          {greetMutation.isLoading ? 'Loading...' : 'Get Greeting'}
        </button>
      </form>
      {greeting && <p>{greeting}</p>}
    </div>
  );
};

export default GreetingForm;
'use client';

import { useState } from 'react';
import { trpc } from '~/trpc/react';

const Home = () => {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  const greetMutation = trpc.greet.greet.useMutation({
    onSuccess: (data) => {
      setGreeting(data.greeting); // 设置问候语
    },
    onError: (error) => {
      setGreeting(error.message); // 设置错误信息
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      setGreeting('Please enter a name.');
      return;
    }
    greetMutation.mutate({ name }); // 调用 mutation
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Greet User</h1>
      <form onSubmit={handleSubmit} className="flex items-center mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border p-2 mr-2 flex-1"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Greet
        </button>
      </form>
      {greeting && <p className="text-lg">{greeting}</p>} {/* 显示问候语或错误信息 */}
    </div>
  );
};

export default Home;

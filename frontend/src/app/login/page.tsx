'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Email/Password Sign-In or Sign-Up
  const handleEmailAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Sign In</h2>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold py-3 rounded-lg shadow hover:bg-slate-100 transition mb-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24"><g><path fill="#4285F4" d="M12 11.5v2.9h4.1c-.2 1.1-1.2 3.2-4.1 3.2-2.5 0-4.5-2.1-4.5-4.6s2-4.6 4.5-4.6c1.4 0 2.4.6 3 1.3l2-2c-1.3-1.2-3-2-5-2-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5c4.3 0 7.2-3 7.2-7.2 0-.5 0-.9-.1-1.3H12z"/><path fill="#34A853" d="M3.5 12.2c0-1.1.2-2.1.6-3l3.7 2.9c-.2.6-.3 1.2-.3 1.8s.1 1.2.3 1.8l-3.7 2.9c-.4-.9-.6-1.9-.6-3z"/><path fill="#FBBC05" d="M12 19.3c-1.7 0-3.2-.6-4.3-1.7l3.3-2.6c.5.1 1 .2 1.6.2.6 0 1.1-.1 1.6-.2l3.3 2.6c-1.1 1.1-2.6 1.7-4.3 1.7z"/><path fill="#EA4335" d="M19.1 10.7c.2-.6.3-1.2.3-1.8s-.1-1.2-.3-1.8l3.7-2.9c.4.9.6 1.9.6 3s-.2 2.1-.6 3l-3.7-2.9z"/></g></svg>
          Sign in with Google
        </button>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleEmailAuth(false);
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleEmailAuth(true)}
            className="bg-purple-600 text-white font-bold py-3 rounded-lg shadow hover:bg-purple-700 transition"
          >
            Sign Up
          </button>
        </form>
        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type={isPasswordVisible ? 'text' : 'password'}
        placeholder="••••••••"
        name="password"
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="btn btn-secondary"
      >
        {isPasswordVisible ? <EyeOff/> : <Eye />}
      </button>
    </div>
  );
}
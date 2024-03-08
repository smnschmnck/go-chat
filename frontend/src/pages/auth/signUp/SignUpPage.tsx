import { getUserData } from '@/api/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from '@/components/ui/Link';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SimpleErrorMessage } from '@/components/ui/SimpleErrorMessage';
import { queryKeys } from '@/configs/queryKeys';
import { env } from '@/env';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { FC, FormEvent, useState } from 'react';

export const SignUpPage: FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');

  const signUp = async (event: FormEvent) => {
    event.preventDefault();

    const res = await fetch(`${env.VITE_BACKEND_HOST}/register`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        authMethod: 'cookie',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await getUserData();
  };

  const signUpMutation = useMutation({
    mutationKey: queryKeys.users.details.queryKey,
    mutationFn: signUp,
    onSuccess: () => {
      navigate({
        to: '/no-email',
      });
    },
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-zinc-500">Please enter your details</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <form
          className="flex w-full flex-col gap-2"
          onSubmit={signUpMutation.mutate}
        >
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="E-Mail"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordInput
            placeholder="Repeat password"
            value={repeatedPassword}
            onChange={(e) => setRepeatedPassword(e.target.value)}
          />
          <Button type="submit">Sign up</Button>
        </form>
        {!!signUpMutation.error && (
          <SimpleErrorMessage>
            {signUpMutation.error.message}
          </SimpleErrorMessage>
        )}
        <div className="flex gap-2">
          <p className="text-sm text-zinc-500">Already got an account?</p>
          <Link to="/sign-in">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

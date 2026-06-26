import { LoginScreen } from '@/components/auth/LoginScreen';

export default function LoginRoute() {
  const handleGoogleLogin = () => {
    return;
  };

  return (
    <LoginScreen
      isLoading={false}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}

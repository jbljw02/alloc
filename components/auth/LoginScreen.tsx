import { ActivityIndicator, Pressable, SafeAreaView, Text, View } from 'react-native';

import { GoogleIcon } from '@/assets/icons';
import { COLORS } from '@/constants/colors';

interface LoginScreenProps {
  errorMessage?: string;
  isLoading: boolean;
  onGoogleLogin: () => void;
}

export const LoginScreen = ({ errorMessage, isLoading, onGoogleLogin }: LoginScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text className="text-[34px] font-bold text-gray-950">Alloc</Text>
          <Text className="mt-3 text-base leading-6 text-gray-500">
            자산 흐름을 간편하게 관리하세요.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
          className="h-16 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-5"
          disabled={isLoading}
          onPress={onGoogleLogin}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.secondaryDark} />
          ) : (
            <>
              <GoogleIcon width={26} height={26} />
              <Text className="ml-4 text-lg font-semibold text-gray-900">구글 계정으로 로그인</Text>
            </>
          )}
        </Pressable>

        {errorMessage ? (
          <Text className="mt-4 text-sm text-red-500">{errorMessage}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

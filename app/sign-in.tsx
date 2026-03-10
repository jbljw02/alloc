import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from '@/constants/colors';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/lib/supabase';
import { isNil } from '@/utils/validators';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_PROVIDER = 'google';

const extractSessionFromUrl = (url: string) => {
  const parsedUrl = new URL(url.replace('#', '?'));
  const accessToken = parsedUrl.searchParams.get('access_token');
  const refreshToken = parsedUrl.searchParams.get('refresh_token');

  if (isNil(accessToken) || isNil(refreshToken)) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
};

export default function SignInScreen() {
  const { isLoading, session } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    setIsSubmitting(true);

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: GOOGLE_PROVIDER,
      });

      setIsSubmitting(false);

      if (error != null) {
        Alert.alert('오류', '구글 로그인 시작에 실패했습니다.');
      }

      return;
    }

    const redirectTo = Linking.createURL('/');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: GOOGLE_PROVIDER,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error != null || isNil(data.url)) {
      setIsSubmitting(false);
      Alert.alert('오류', '구글 로그인 시작에 실패했습니다.');
      return;
    }

    const authSessionResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    setIsSubmitting(false);

    if (authSessionResult.type !== 'success') {
      Alert.alert('알림', '로그인이 취소되었습니다.');
      return;
    }

    const nextSession = extractSessionFromUrl(authSessionResult.url);

    if (isNil(nextSession)) {
      Alert.alert('오류', '로그인 세션을 확인하지 못했습니다.');
      return;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: nextSession.accessToken,
      refresh_token: nextSession.refreshToken,
    });

    if (sessionError != null) {
      Alert.alert('오류', '로그인 세션 저장에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-base text-gray-500">세션을 확인하는 중입니다.</Text>
      </SafeAreaView>
    );
  }

  if (session != null) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center px-6"
      >
        <View className="bg-white rounded-3xl p-6" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 8 }, elevation: 3 }}>
          <Text className="text-3xl font-bold text-gray-900 mb-3">Alloc 로그인</Text>
          <Text className="text-sm text-gray-500 mb-6">Google 계정으로 로그인해 자산 데이터를 보호합니다.</Text>

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleSignIn}
            className="rounded-2xl py-4 px-5"
            style={{ backgroundColor: '#FFFFFF', opacity: isSubmitting ? 0.6 : 1, borderWidth: 1, borderColor: '#E5E7EB' }}
          >
            <View className="flex-row items-center justify-center">
              <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={{ backgroundColor: COLORS.primaryLight }}>
                <Text className="font-bold" style={{ color: COLORS.primary }}>G</Text>
              </View>
              <Text className="text-base font-semibold text-gray-900">
                {isSubmitting ? '연결 중...' : 'Google로 계속하기'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// app/index.tsx
import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/Community" />;
}
export const screenOptions = {
    href: null, // 👈 이거 추가하면 하단 탭에서 안 보이게 됨
  };
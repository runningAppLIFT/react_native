import { Link, Href } from 'expo-router'; // Href 타입 가져오기
import { openBrowserAsync } from 'expo-web-browser';
import { ComponentProps } from 'react';
import { Platform } from 'react-native';

// Omit 대신 Omit 유틸리티를 직접 구현하거나 소문자로 변경 (React에 내장된 omit은 없음)
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href }; // href를 Href로 변경

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          // Href는 string | object일 수 있으므로, string으로 단언
          await openBrowserAsync(typeof href === 'string' ? href : String(href));
        }
      }}
    />
  );
}
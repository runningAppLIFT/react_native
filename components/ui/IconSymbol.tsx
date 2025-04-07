import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, Platform, StyleProp, ViewStyle } from 'react-native';

// SF Symbols와 Material Icons 매핑
const MAPPING = {
  'house.fill': 'home',
  // 'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'map.fill': 'map',
  'figure.run': 'directions-run', 
  'play.fill': 'play-arrow',     
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  'person.3': 'group',                   // 세 사람 (커뮤니티)
  'bubble.left.and.bubble.right': 'forum', // 대화와 소통
  'a.magnify': 'search' ,// 돋보기 (검색)
  'thumb-up-off-alt': 'thumb-up-off-alt', 
  'chat-bubble-outline': 'chat-bubble-outline', // 채팅 말풍선

} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * 플랫폼에 따라 SF Symbols (iOS) 또는 Material Icons (Android/web)를 사용하는 아이콘 컴포넌트
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // iOS에서는 SF Symbols 사용, 그 외에는 Material Icons 사용
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name}
        size={size}
        tint={color}
        style={style}
        weight={weight}
      />
    );
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
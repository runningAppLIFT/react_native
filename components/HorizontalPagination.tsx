import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';

interface HorizontalPaginationProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  itemsPerPage?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HorizontalPagination<T>({
  data,
  renderItem,
  itemsPerPage = 4,
}: HorizontalPaginationProps<T>) {
  const pageCount = Math.ceil(data.length / itemsPerPage);

  const getPagedData = () => {
    const pages: T[][] = [];
    for (let i = 0; i < pageCount; i++) {
      pages.push(data.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
    }
    return pages;
  };

  const pagedData = getPagedData();

  return (
    <FlatList
      data={pagedData}
      keyExtractor={(_, index) => `page-${index}`}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.page}>
          {item.map((entry, idx) => (
            <View key={idx} style={styles.itemWrapper}>
              {renderItem({ item: entry })}
            </View>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    width: SCREEN_WIDTH,
    padding: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemWrapper: {
    width: (SCREEN_WIDTH - 40) / 2, // 2 items per row
    marginBottom: 10,
  },
});

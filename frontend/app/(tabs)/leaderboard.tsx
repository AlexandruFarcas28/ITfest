import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import ScreenHeader from '../../src/components/ScreenHeader';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { leaderboardScreenStyles as styles } from '../../src/styles/screens/tabs';

const users = [
  { rank: 1, name: 'Alex', score: '12,540 steps' },
  { rank: 2, name: 'Cristi', score: '11,920 steps' },
  { rank: 3, name: 'Maria', score: '10,880 steps' },
  { rank: 4, name: 'Demo User', score: '9,740 steps' },
  { rank: 5, name: 'Bianca', score: '8,960 steps' },
];

export default function LeaderboardScreen() {
  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="LEADERBOARD"
        title="Top performers"
        subtitle="A simple ranking view for activity, consistency or community challenges."
      />

      {users.map((user) => (
        <View key={user.rank} style={commonStyles.card}>
          <View style={styles.row}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{user.rank}</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userScore}>{user.score}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

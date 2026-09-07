import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Film, Calendar, Award, User } from 'lucide-react-native';

export default function TabLayout() {
  // Role can be read from storage / auth state. By default Investor gets 5 tabs.
  const userRole = 'INVESTOR'; 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d121f',
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Expo Floor',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="showcase"
        options={{
          title: 'Showcase',
          tabBarIcon: ({ color, size }) => <Film color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Meetings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color, size }) => <Award color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size || 20} />,
        }}
      />
    </Tabs>
  );
}

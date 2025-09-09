import { Stack } from "expo-router";
import React from "react";

const InventoryManagementLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="AddProperties" options={{ title: "Add Properties", headerShown: false }} />
      <Stack.Screen name="ManageProperties" options={{ title: "Manage Properties", headerShown: false }} />
      <Stack.Screen name="FollowUp" options={{ title: "Follow Up", headerShown: false }} />
    </Stack>
  );
};

export default InventoryManagementLayout;

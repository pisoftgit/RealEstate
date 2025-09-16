import { Stack } from "expo-router";
import React from "react";

const InventoryManagementLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="AddProperties" options={{ title: "Add Properties", headerShown: false }} />
      <Stack.Screen name="ManageProperties" options={{ title: "Manage Properties", headerShown: false }} />
      <Stack.Screen name="AddBuilder" options={{ title: "Add Builder", headerShown: false }} />
      <Stack.Screen name="AddProject" options={{ title: "Add Project", headerShown: false }} />
      <Stack.Screen name="ManageProjects" options={{ title: "Manage Projects", headerShown: false }} />
      <Stack.Screen name="ManageBuilder" options={{ title: "Manage Builder", headerShown: false }} />
      <Stack.Screen name="FollowUp" options={{ title: "Follow Up", headerShown: false }} />
    </Stack>
  );
};

export default InventoryManagementLayout;

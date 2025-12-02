import CustomHeader from '@/components/custom/custom-header';
import DrawerContent from '@/components/custom/drawer-content';
import { Drawer } from 'expo-router/drawer';
import { HelpCircle, Home, List, Shield } from 'lucide-react-native';

const ACTIVE_ICON = (focused: boolean) => (focused ? '#eab308' : '#000');

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        header: ({ navigation, options: { title } }) => (
          <CustomHeader navigation={navigation} title={title} />
        ),
        drawerActiveTintColor: '#eab308',
        drawerActiveBackgroundColor: '#fff',
        drawerItemStyle: {
          borderRadius: 8,
        },
      }}>
      <Drawer.Screen
        name="(tab)"
        options={{
          title: 'Home',
          drawerIcon: ({ focused, size }) => <Home size={size} color={ACTIVE_ICON(focused)} />,
        }}
      />
      <Drawer.Screen
        name="my-listing"
        options={{
          title: 'My Listing',
          drawerIcon: ({ focused, size }) => <List size={size} color={ACTIVE_ICON(focused)} />,
        }}
      />
      <Drawer.Screen
        name="guideline"
        options={{
          title: 'Guideline',
          drawerIcon: ({ focused, size }) => (
            <HelpCircle size={size} color={ACTIVE_ICON(focused)} />
          ),
        }}
      />
      <Drawer.Screen
        name="terms"
        options={{
          title: 'Terms & Conditions',
          drawerIcon: ({ focused, size }) => <Shield size={size} color={ACTIVE_ICON(focused)} />,
        }}
      />
    </Drawer>
  );
}

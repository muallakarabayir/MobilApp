import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserList from './screens/UserListScreen';
import AddBloodTest from './screens/AddBloodTest';
import UserPage from './screens/UserScreen';
import Details from './screens/DetailsScreen';
import CompareScreen from './screens/CompareScreen';
import Results from './screens/ResultScreen';
import UserCompareScreen from './screens/UserCompareScreen';
import UserResultScreen from './screens/UserResultScreen';
import AdminAssign from './screens/AdminAssignScreen';
import CreateGuide from './screens/CreateGuideScreen';
import CreateUser from './screens/CreateUserScreen';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';



// Create Drawer navigation
const Drawer = createDrawerNavigator();

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(); // Firestore bağlantısı
  const auth = getAuth(); // Firebase Authentication

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = auth.currentUser; // Şu anki oturum açmış kullanıcı
        if (user) {
          console.log(`Giriş yapan kullanıcı UID: ${user.uid}`); // Kullanıcı UID'sini yazdır

          // Firestore'da UID'ye göre sorgu yap
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              console.log('Kullanıcı verisi:', userData); // Kullanıcı verisini yazdır
              setIsAdmin(userData.isAdmin || false); // Admin durumu
              console.log(`Admin durumu: ${userData.isAdmin}`); // Admin durumunu yazdır
            });
          } else {
            console.log('Kullanıcı belgesi bulunamadı.');
          }

          setIsAuthenticated(true); // Kullanıcı oturum açtı
        } else {
          console.log('Oturum açmış kullanıcı yok.');
        }
      } catch (error) {
        console.error('Admin kontrolü sırasında hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Eğer kullanıcı oturum açmamışsa, Login ve Register ekranlarını göster
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Drawer.Navigator>
          <Drawer.Screen name="Login" component={LoginScreen} />
          <Drawer.Screen name="Register" component={RegisterScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }

  // Eğer kullanıcı oturum açmışsa, drawer navigasyonu render et
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerShown: true, // Üstte başlık göster
        }}
      >
        {/* Tüm kullanıcılar için ortak ekranlar */}
        <Drawer.Screen name="User" component={UserPage} />
       
        

        {/* Kullanıcı admin ise "Add Blood Test" ekranını göster */}
        {isAdmin && (
          <>
          <Drawer.Screen name="Add Blood Test" component={AddBloodTest} />
          <Drawer.Screen name='Create User' component={CreateUser}/>
          <Drawer.Screen name="User List" component={UserList} />
          <Drawer.Screen name="Admin Assign" component={AdminAssign} />
          <Drawer.Screen name="Compare" component={CompareScreen} />
        <Drawer.Screen name="User Compare" component={UserCompareScreen} />
        <Drawer.Screen name="Create Guide" component={CreateGuide}/>

        <Drawer.Screen 
          name="Results" 
          component={Results}
          options={{
            drawerItemStyle: { display: 'none' }, // Menüden gizle
          }}
        />
        <Drawer.Screen 
          name="UserResult" 
          component={UserResultScreen}
          options={{
            drawerItemStyle: { display: 'none' }, // Menüden gizle
          }}
        />
        <Drawer.Screen 
          name="Details" 
          component={Details}
          options={{
            drawerItemStyle: { display: 'none' }, // Menüden gizle
          }}
        />
        </>
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

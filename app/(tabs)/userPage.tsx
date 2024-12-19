import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList,TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getAuth,onAuthStateChanged,signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

interface TestResult {
  id: string;
  testName: string;
  value: string;
}

export default function UserPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  const db = getFirestore();
  const auth = getAuth();
  const router = useRouter();

  // Kullanıcı oturumu kontrolü
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setEmail(user.email);
        await fetchTestResults(user.uid); // Kullanıcıya ait kan tahlilleri verisini al
      } else {
        setEmail(null);
        setTestResults([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert('Successfully signed out!');
      router.replace('/'); // Oturum kapatıldıktan sonra giriş sayfasına yönlendirin.
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out: ' );
    }
  };


  // Kan tahlilleri verilerini çekme
  const fetchTestResults = async (userId: string) => {
    setLoading(true);
    try {
      // 'bloodTests' koleksiyonundan kullanıcıya ait test sonuçlarını çekiyoruz
      const testResultsQuery = query(
        collection(db, 'bloodTests'),
        where('userId', '==', userId) // userId'ye göre filtreleme yapıyoruz
      );
      const querySnapshot = await getDocs(testResultsQuery);

      const results: TestResult[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        testName: 'Blood Test Results', // Bu kısımdan istediğiniz test ismini kullanabilirsiniz
        value: JSON.stringify(doc.data(), null, 2), // Veriyi daha okunabilir bir formatta gösteriyoruz
      }));

      setTestResults(results);

      // Kan tahlilleri verisini konsola yazdırıyoruz
      console.log('User Blood Test Results:', results);
    } catch (error) {
      console.error('Error fetching test results:', error);
      Alert.alert('Error', 'Failed to fetch test results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to User Page!</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      {email ? (
        <Text style={styles.emailText}>Logged in as: {email}</Text>
      ) : (
        <Text style={styles.emailText}>No user logged in</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Blood Test Results:</Text>
          <FlatList
            data={testResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.bloodTestItem}>
                <Text style={styles.bloodTestText}>Test Name: {item.testName}</Text>
                <Text style={styles.bloodTestText}>Results: {item.value}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  welcomeText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop:25,
    marginBottom: 10,
  },
  emailText: {
    color: '#black',
    fontSize: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  bloodTestItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  bloodTestText: {
    color: 'black',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    width: 200,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

interface TestResult {
  id: string;
  testName: string;
  values: { [key: string]: string };
}

export default function UserPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  const db = getFirestore();
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);
        await fetchTestResults(user.uid);
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
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out.');
    }
  };

  const fetchTestResults = async (uid: string) => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), where('uid', '==', uid));
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        console.warn('No user found with this UID:', uid);
        return;
      }

      const userId = usersSnapshot.docs[0].id;

      const testResultsQuery = query(
        collection(db, 'bloodTests'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(testResultsQuery);

      if (querySnapshot.empty) {
        console.warn('No blood test results found for this userId:', userId);
        return;
      }

      const results: TestResult[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          testName: `Test ${doc.id.substring(0, 5)}`,
          values: data,
        };
      });

      setTestResults(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
      Alert.alert('Error', 'Failed to fetch test results.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPress = (test: TestResult) => {
    setSelectedTest(test);
    setModalVisible(true);
  };

  const renderTestValues = (values: { [key: string]: string }) => {
    return (
      <FlatList
        data={Object.entries(values)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item[0]}</Text> {/* Ensure text is wrapped in Text */}
            <Text style={styles.tableCell}>{item[1]}</Text> {/* Ensure text is wrapped in Text */}
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      {email ? (
        <Text style={styles.emailText}>Logged in as: {email}</Text>
      ) : (
        <Text style={styles.emailText}>No user logged in</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Blood Test Results:</Text>
          <FlatList
            data={testResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => handleTestPress(item)}
              >
                <Text style={styles.testButtonText}>{item.testName}</Text> {/* Metin burada sarılmış olmalı */}
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text> {/* Ensure text is wrapped in Text */}
      </TouchableOpacity>

      {/* Modal for test details */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTest && (
              <>
                <Text style={styles.modalTitle}>{selectedTest.testName}</Text> {/* Ensure text is wrapped in Text */}
                <View style={styles.table}>
                  {renderTestValues(selectedTest.values)} {/* Render values inside a FlatList */}
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text> {/* Ensure text is wrapped in Text */}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 75,
  },
  emailText: {
    color: '#000',
    fontSize: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  testButton: {
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    width: 200,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: 200,
    marginBottom: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  closeButton: {
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});

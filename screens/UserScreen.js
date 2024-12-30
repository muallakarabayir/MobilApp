import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function User() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [email, setEmail] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const navigation = useNavigation();

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
      navigation.navigate("Login");
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out.');
    }
  };

  const fetchTestResults = async (uid) => {
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

      const results = querySnapshot.docs.map((doc) => {
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

  const handleTestPress = (test) => {
    setSelectedTest(test);
    setModalVisible(true);
  };

  const renderTestValues = (values) => {
    return (
      <FlatList
        data={Object.entries(values)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item[0]}</Text>
            <Text style={styles.tableCell}>{item[1]}</Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        {email ? (
          <Text style={styles.emailText}>{email}</Text>
        ) : (
          <Text style={styles.emailText}>No user logged in</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Blood Test Results</Text>
          <FlatList
            data={testResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => handleTestPress(item)}
              >
                <Text style={styles.testButtonText}>{item.testName}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

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
                <Text style={styles.modalTitle}>{selectedTest.testName}</Text>
                <View style={styles.table}>
                  {renderTestValues(selectedTest.values)}
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
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
    backgroundColor: '#F4F7FC',
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: '#333',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  emailText: {
    color: '#555',
    fontSize: 18,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 15,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 15,
    marginVertical: 8,
    width: "300",
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF6347',
    padding: 12,
    borderRadius: 20,
    marginTop: 20,
    width: '70%',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    maxHeight: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  table: {
    marginTop: 15,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    textAlign: 'left',
    color: '#444',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 20,
    marginTop: 5,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

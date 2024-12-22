import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from '@firebase/firestore';

interface User {
  id: string;
  email: string;
}

interface TestResult {
  id: string;
  testName: string;
  values: { [key: string]: string };
}

const { height } = Dimensions.get('window');

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: User[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchTestResults = async (userId: string) => {
    setLoading(true);
    try {
      const testResultsQuery = query(
        collection(db, 'bloodTests'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(testResultsQuery);

      const results: TestResult[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        testName: `Test ${doc.id.substring(0, 5)}`,
        values: doc.data(),
      }));

      setTestResults(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
      Alert.alert('Error', 'Failed to fetch test results.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    setSelectedUserId(userId);
    fetchTestResults(userId);
  };

  const handleTestPress = (test: TestResult) => {
    setSelectedTest(test);
    setModalVisible(true);
  };

  // Function to determine the status (Low/High/Normal)
  const determineStatus = (testName: string, value: number) => {
    // Normalize the test name (convert to lowercase)
    const normalizedTestName = testName.toLowerCase();
  
    const ranges: { [key: string]: { low: number; high: number } } = {
      igg: { low: 470, high: 1300 },
      iga: { low: 50, high: 400 },
      igm: { low: 50, high: 300 },
      igg1: { low: 30, high: 1000 },
      igg2: { low: 30, high: 1000 },
      igg3: { low: 30, high: 1000 },
      igg4: { low: 30, high: 1000 },
      tetanustoxoid: { low: 0.1, high: 5 },
      prp: { low: 0, high: 5 },
      pneumococcus: { low: 0, high: 5 },
      antia: { low: 0, high: 100 },
      antib: { low: 0, high: 100 },
    };
  
    // Check if the normalized test name exists in ranges
    if (ranges[normalizedTestName]) {
      if (value < ranges[normalizedTestName].low) return 'Low';
      if (value > ranges[normalizedTestName].high) return 'High';
      return 'Normal';
    }
  
    return 'Unknown'; // If no range is defined
  };
  
  const renderTestValues = (values: { [key: string]: string }) => {
    return (
      <FlatList
        data={Object.entries(values)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const testName = item[0];
          const value = parseFloat(item[1]);

          const status = determineStatus(testName, value);

          return (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{testName}</Text>
              <Text style={styles.tableCell}>{item[1]}</Text>
              <Text style={styles.tableCell}>{status}</Text>
            </View>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      <View style={styles.flatListContainer}>
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.userItem,
                selectedUserId === item.id && styles.selectedUser,
              ]}
              onPress={() => handleUserPress(item.id)}
            >
              <Text style={styles.userText}>{item.email}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {selectedUserId && (
        <>
          <Text style={styles.subtitle}>Test Results</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <View style={styles.testButtonsContainer}>
              {testResults.map((test) => (
                <TouchableOpacity
                  key={test.id}
                  style={styles.testButton}
                  onPress={() => handleTestPress(test)}
                >
                  <Text style={styles.testButtonText}>{test.testName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

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
    padding: 16,
    backgroundColor: '#fff',
    alignContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#444',
  },
  flatListContainer: {
    maxHeight: height * 0.5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedUser: {
    backgroundColor: '#7f44ff',
  },
  userText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  testButtonsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: 'navy',
    padding: 15,
    borderRadius: 25,
    marginVertical: 5,
    width: 200,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    color: '#fff',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

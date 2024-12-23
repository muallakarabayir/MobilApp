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
  age: number; // Yaşı artık direkt Firebase'den alacağız.
}

interface TestResult {
  id: string;
  testName: string;
  values: { [key: string]: string };
}

const ranges: { [key: string]: { ageRange: string; low: number; high: number }[] } = {
  igG: [
    { ageRange: '0-1', low: 700, high: 1300 },
    { ageRange: '1-4', low: 280, high: 750 },
    { ageRange: '4-7', low: 200, high: 1200 },
    { ageRange: '7-13', low: 300, high: 1500 },
    { ageRange: '13-36', low: 400, high: 1300 },
    { ageRange: '36-72', low: 600, high: 1500 },
    { ageRange: '72-1200', low: 639, high: 1344 },
  ],
  igA: [
    { ageRange: '0-1', low: 0, high: 11 },
    { ageRange: '1-4', low: 6, high: 50 },
    { ageRange: '4-7', low: 8, high: 90 },
    { ageRange: '7-13', low: 16, high: 100 },
    { ageRange: '13-36', low: 20, high: 230 },
    { ageRange: '36-72', low: 50, high: 150 },
    { ageRange: '72-1200', low: 70, high: 312 },
  ],
  igM: [
    { ageRange: '0-1', low: 700, high: 1300 },
    { ageRange: '1-4', low: 280, high: 750 },
    { ageRange: '4-7', low: 200, high: 1200 },
    { ageRange: '7-13', low: 300, high: 1500 },
    { ageRange: '13-36', low: 400, high: 1300 },
    { ageRange: '36-72', low: 600, high: 1500 },
    { ageRange: '72-1200', low: 639, high: 1344 },
  ],
  igG1: [
    { ageRange: '0-3', low: 700, high: 1300 },
    { ageRange: '3-6', low: 280, high: 750 },
    { ageRange: '6-9', low: 200, high: 1200 },
    { ageRange: '9-24', low: 300, high: 1500 },
    { ageRange: '24-48', low: 400, high: 1300 },
    { ageRange: '48-72', low: 600, high: 1500 },
    { ageRange: '72-96', low: 639, high: 1344 },
    { ageRange: '96-120', low: 639, high: 1344 },
    { ageRange: '120-168', low: 639, high: 1344 },
    { ageRange: '168-1200', low: 422, high: 1292 },

  ],
  igG2: [
    { ageRange: '0-3', low: 40, high: 167 },
    { ageRange: '3-6', low: 23, high: 147 },
    { ageRange: '6-9', low: 37, high: 60 },
    { ageRange: '9-24', low: 30, high: 327 },
    { ageRange: '24-48', low: 70, high: 443},
    { ageRange: '48-72', low: 113, high: 480 },
    { ageRange: '72-96', low: 163, high: 513 },
    { ageRange: '96-120', low: 147, high: 493 },
    { ageRange: '120-168', low: 140, high: 440},
    { ageRange: '168-1200', low: 117, high: 747 },

  ],
  igG3: [
    { ageRange: '0-3', low: 4, high: 23 },
    { ageRange: '3-6', low:4, high: 100 },
    { ageRange: '6-9', low: 12, high: 62},
    { ageRange: '9-24', low: 13, high: 82 },
    { ageRange: '24-48', low: 17, high: 90},
    { ageRange: '48-72', low: 8, high: 111 },
    { ageRange: '72-96', low: 15, high: 113 },
    { ageRange: '96-120', low: 12, high: 179 },
    { ageRange: '120-168', low: 23, high: 117},
    { ageRange: '168-1200', low: 41, high: 129 },

  ],
  igG4: [
    { ageRange: '0-3', low: 1, high: 120 },
    { ageRange: '3-6', low: 1, high: 120 },
    { ageRange: '6-9', low: 1, high: 120 },
    { ageRange: '9-24', low: 1, high: 120 },
    { ageRange: '24-48', low: 1, high: 120},
    { ageRange: '48-72', low: 2, high: 138 },
    { ageRange: '72-96', low: 1, high: 95 },
    { ageRange: '96-120', low: 1, high: 153 },
    { ageRange: '120-168', low: 1, high: 143},
    { ageRange: '168-1200', low: 10, high: 67 },

  ],
  antiA: [
    { ageRange: '0-1', low: 10, high: 20 },
    { ageRange: '1-4', low: 15, high: 30 },
    // Diğer yaş aralıkları
  ],
  antiB: [
    { ageRange: '0-1', low: 10, high: 20 },
    { ageRange: '1-4', low: 15, high: 30 },
    // Diğer yaş aralıkları
  ],
  prp: [
    { ageRange: '0-1', low: 5, high: 15 },
    { ageRange: '1-4', low: 10, high: 25 },
    // Diğer yaş aralıkları
  ],
  pheumococcus: [
    { ageRange: '0-1', low: 5, high: 15 },
    { ageRange: '1-4', low: 10, high: 25 },
    // Diğer yaş aralıkları
  ],
  tetanusToxoid: [
    { ageRange: '0-1', low: 5, high: 15 },
    { ageRange: '1-4', low: 10, high: 25 },
    // Diğer yaş aralıkları
  ],
};

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
          age: parseInt(doc.data().age), // Firebase'den yaş bilgisini alıyoruz.
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

  const getRangeByAge = (testName: string, age: number) => {
    const testRanges = ranges[testName]; // ranges objesinden testin aralıklarını alıyoruz.
    {
      console.log(`No ranges found for test: ${testName}`);
      return null; // Eğer test adı ranges içinde yoksa, null döner.
    }
  
    // Yaş aralığını buluyoruz
    for (let range of testRanges) {
      const [lowAge, highAge] = range.ageRange.split('-').map(Number);
      if (age >= lowAge && age <= highAge) {
        return range; // Yaşa uygun aralığı bulup döndürüyoruz.
      }
    }
    return null;
    
  };
  

  const determineStatus = (testName: string, age: number, value: number) => {
    const range = getRangeByAge(testName, age);
  if (!range) return 'No range available'; // Eğer yaş aralığı bulunamazsa.

  const { low, high } = range;

  // Kan testi değerini karşılaştırıyoruz
  if (value < low) {
    return 'Low';
  } else if (value > high) {
    return 'High';
  } else {
    return 'Normal';
  }
  };

  const renderTestValues = (values: { [key: string]: string }, userAge: number) => {
    return (
      <FlatList
        data={Object.entries(values).filter(([key]) => key !== 'userId' && key !== 'age' && key !== 'date')}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const testName = item[0];
          const value = parseFloat(item[1]);
  
          const status = determineStatus(testName, userAge, value);
  
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
        {isFetching ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selectedUserId === item.id && styles.selectedUser,
                ]}
                onPress={() => {
                  setSelectedUserId(item.id);
                  fetchTestResults(item.id);
                }}
              >
                <Text style={styles.userText}>{item.email}</Text>
              </TouchableOpacity>
            )}
          />
        )}
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
                  onPress={() => {
                    setSelectedTest(test);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.testButtonText}>{test.testName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

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
                  {users.find(user => user.id === selectedUserId) &&
                    renderTestValues(selectedTest.values, users.find(user => user.id === selectedUserId)!.age)}
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

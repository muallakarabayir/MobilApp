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
import { db } from '../firebase/firebaseConfig.js';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function UserCompare() {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userAge, setUserAge] = useState(null);

  // Fetching users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({
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

  const fetchTestResults = async (userId) => {
    setLoading(true);
    try {
      const testResultsQuery = query(
        collection(db, 'bloodTests'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(testResultsQuery);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        testName: `Test ${doc.id.substring(0, 5)}`,
        values: doc.data(),
        date: doc.data().date,
      }));
  
      // Sort results by date (latest first)
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
  
      setTestResults(results);
  
      // Set user age from the first test
      const firstTestDoc = querySnapshot.docs[0];
      if (firstTestDoc) {
        const age = firstTestDoc.data().age || 'N/A';
        setUserAge(age);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      Alert.alert('Error', 'Failed to fetch test results.');
    } finally {
      setLoading(false);
    }
  };

  const renderTestValues = (values) => {
    return (
      <FlatList
        data={Object.entries(values).filter(([key]) => key !== 'userId' && key !== 'age' && key !== 'date')}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const testName = item[0];
          const value = parseFloat(item[1]);
          const testDate = values.date || "Date not available"; 

          // Get previous test data for comparison
          const previousTest = getPreviousTest(values.id, testName);

          const previousTestData = previousTest ? previousTest[testName] : 'N/A';
          const previousTestDate = previousTest ? previousTest.date : 'N/A';

          return (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{testName}</Text>
              <Text style={styles.tableCell}>{item[1]}</Text>
              <Text style={styles.tableCell}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("UserResult", {
                      testName: testName,
                      testValue: value,
                      userAge: userAge,
                      testDate: testDate,
                      previousTestValue: previousTestData,
                      previousTestDate: previousTestDate,
                    });
                  }}
                >
                  <Text style={styles.buttonText}>Compare</Text>
                </TouchableOpacity>
              </Text>
            </View>
          );
        }}
      />
    );
  };

  // Function to get previous test values
  const getPreviousTest = (userId, testName) => {
    // Find previous test data for comparison based on userId and testName
    const previousTestData = testResults.find(test => test.id !== userId && test.values[testName]);
    return previousTestData ? previousTestData.values : null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.flatListContainer}>
        {isFetching ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.userItem, selectedUserId === item.id && styles.selectedUser]}
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

      {/* Modal to show detailed test results */}
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
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
    maxHeight: '70%',
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
    marginTop:50,
  },
  button: {
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
 
    width: 300,
    height: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
});

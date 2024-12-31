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
  TextInput,
} from 'react-native';
import { db } from '../firebase/firebaseConfig.js';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function UserList() {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userAge, setUserAge] = useState(null);
  const [userCreatedAt, setUserCreatedAt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetching users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            email: doc.data().email,
            username: doc.data().username,
            birthDate: doc.data().birthDate,
            createdAt: doc.data().createdAt,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            isAdmin: doc.data().isAdmin,
          };
        });
        setUsers(usersList);
        setFilteredUsers(usersList); // Initially set the filtered list to all users
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

// Search users by username or email
const handleSearch = (text) => {
  setSearchQuery(text);

  if (text) {
    const filtered = users.filter(user =>
      (user.username && user.username.toLowerCase().includes(text.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredUsers(filtered);
  } else {
    setFilteredUsers(users); // Reset to all users if search is cleared
  }
};


  // Calculate the age based on birthDate
  const calculateAge = (birthDate) => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth() - birthDateObj.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Format createdAt to a readable date
  const formatCreatedAt = (timestamp) => {
    const date = timestamp.toDate(); // Convert Firestore timestamp to JS Date
    return date.toLocaleString(); // Use toLocaleString for readable format
  };

  // Fetching test results and age from the bloodTests collection
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
      }));

      // Fetching age from birthDate and createdAt
      const user = users.find((user) => user.id === userId);
      if (user) {
        const age = calculateAge(user.birthDate);
        setUserAge(age);
        setUserCreatedAt(formatCreatedAt(user.createdAt));
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
      Alert.alert('Error', 'Failed to fetch test results.');
    } finally {
      setLoading(false);
    }
  };

  // Rendering the test values inside the modal
  const renderTestValues = (values) => {
    return (
      <FlatList
        data={Object.entries(values).filter(([key]) => key !== 'userId' && key !== 'age' && key !== 'date')}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const testName = item[0];
          const value = parseFloat(item[1]);

          return (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{testName}</Text>
              <Text style={styles.tableCell}>{item[1]}</Text>
              <Text style={styles.tableCell}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setModalVisible(false); // Close the modal
                    // Navigate to "Details" screen with test details and user age
                    navigation.navigate('Details', {
                      testName: testName,
                      testValue: value,
                      userAge: userAge,
                    });
                  }}
                >
                  <Text style={styles.buttonText}>Detail</Text>
                </TouchableOpacity>
              </Text>
            </View>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by username or email"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={styles.flatListContainer}>
        {isFetching ? (
          <ActivityIndicator size="large" color="#7f44ff" />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.userItem, selectedUserId === item.id && styles.selectedUser]}
                onPress={() => {
                  setSelectedUserId(item.id);
                  fetchTestResults(item.id);
                }}
              >
                <Text style={styles.userText}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.userText}>{item.email}</Text>
                <Text style={styles.userText}>{`Age: ${calculateAge(item.birthDate)}`}</Text>
                <Text style={styles.userText}>{`Account Created: ${formatCreatedAt(item.createdAt)}`}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {selectedUserId && (
        <>
          <Text style={styles.subtitle}>Test Results</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#7f44ff" />
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

                {/* Display the test results */}
                <View style={styles.table}>
                  {selectedTest && renderTestValues(selectedTest.values)}
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
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
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
    flex: 1,
    marginBottom: 15,
    borderRadius: 10,
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
    backgroundColor: '#9C7EC9',
  },
  userText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
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
    width: 250,
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
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    padding: 10,
  },
  closeButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    width: 300,
    height:40,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

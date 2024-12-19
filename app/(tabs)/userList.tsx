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
  ScrollView,
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
  value: string;
}

const { height } = Dimensions.get('window');

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
        testName: 'Blood Test Results',
        value: JSON.stringify(doc.data(), null, 2),
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
            <ScrollView>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.cell]}>Test Name</Text>
                  <Text style={[styles.tableHeaderText, styles.cell]}>Value</Text>
                </View>
                {testResults.map((item, index) => {
                  let parsedValue = {};
                  try {
                    parsedValue = JSON.parse(item.value);
                  } catch (error) {
                    console.error('Error parsing test result value:', error);
                  }
                  return (
                    <View key={index}>
                      {Object.entries(parsedValue).map(([key, val], idx) => (
                        <View key={idx} style={styles.tableRow}>
                          <Text style={[styles.tableRowText, styles.cell]}>{key}</Text>
                          <Text style={[styles.tableRowText, styles.cell]}>
                            {val !== undefined && val !== null ? String(val) : 'No value'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </>
      )}
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
  tableContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    padding: 10,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRowText: {
    fontSize: 14,
    color: '#333',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
});
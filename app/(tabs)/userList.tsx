import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
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

// Helper function to check if a value is high, low, or normal
const getTestResultStatus = (value: number, referenceRange: [number, number]): string => {
  if (value < referenceRange[0]) return 'Low';
  if (value > referenceRange[1]) return 'High';
  return 'Normal';
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Kullanıcıları Firestore'dan çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: User[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
        }));
        setUsers(usersList);
        console.log('Fetched users:', usersList); // Debugging log
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

  // Kullanıcının test sonuçlarını çek
  const fetchTestResults = async (userId: string) => {
    setLoading(true);
    try {
      const testResultsQuery = query(
        collection(db, 'bloodTests'), // bloodTests koleksiyonu
        where('userId', '==', userId) // userId'ye göre filtreleme
      );
      const querySnapshot = await getDocs(testResultsQuery);

      const results: TestResult[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        testName: 'Blood Test Results',
        value: JSON.stringify(doc.data(), null, 2), // JSON verisini string formatında al
      }));
      

      console.log('Fetched test results:', results);
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
    fetchTestResults(userId); // Seçilen kullanıcının test sonuçlarını getir
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      {/* Kullanıcı Listesi */}
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

      {/* Test Sonuçları */}
      {selectedUserId && (
        <>
          <Text style={styles.subtitle}>Test Results</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={testResults}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                let parsedValue = {};
                try {
                  // JSON stringini parse et
                  parsedValue = JSON.parse(item.value);
                } catch (error) {
                  console.error('Error parsing test result value:', error);
                }
              
                return (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultText}>{item.testName}</Text>
                    {Object.entries(parsedValue).map(([key, val]) => (
                      <Text key={key} style={styles.resultText}>
                        {key}: {val !== undefined && val !== null ? String(val) : 'No value'}
                      </Text>
                    ))}
                  </View>
                );
              }}
              
            />
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
  resultItem: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ActivityIndicator, Image, ScrollView } from 'react-native';
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

      results.sort((a, b) => b.id.localeCompare(a.id));

      const resultsWithComparison = results.map((test, index) => {
        if (index === 0) return { ...test, comparison: null };

        const previousTest = results[index - 1];
        const comparison = compareTestResults(previousTest.values, test.values);

        return { ...test, comparison };
      });

      setTestResults(resultsWithComparison);
    } catch (error) {
      console.error('Error fetching test results:', error);
      Alert.alert('Error', 'Failed to fetch test results.');
    } finally {
      setLoading(false);
    }
  };

  const compareTestResults = (previousValues, currentValues) => {
    const comparison = {};

    Object.entries(currentValues).forEach(([key, value]) => {
      if (previousValues[key] !== undefined) {
        if (value > previousValues[key]) {
          comparison[key] = 'higher';
        } else if (value < previousValues[key]) {
          comparison[key] = 'lower';
        } else {
          comparison[key] = 'equal';
        }
      }
    });

    return comparison;
  };

  const handleTestPress = (test) => {
    setSelectedTest(test);
    setModalVisible(true);
  };

  const renderTestValues = (values, comparison) => {
    return (
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {Object.entries(values).map(([key, value]) => (
            <View key={key} style={styles.tableRow}>
              <Text style={styles.tableCell}>{key}</Text>
              <Text style={styles.tableValue}>{value}</Text>
              {comparison && comparison[key] && (
                <View style={styles.comparisonImageContainer}>
                  {renderComparisonImage(comparison[key])}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderComparisonImage = (comparisonValue) => {
    let imageSource;
    if (comparisonValue === 'higher') {
      imageSource = require('../assets/up.png');
    } else if (comparisonValue === 'lower') {
      imageSource = require('../assets/down.png');
    } else if (comparisonValue === 'equal') {
      imageSource = require('../assets/equal.png');
    }

    return <Image source={imageSource} style={styles.comparisonImage} />;
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
                  {renderTestValues(
                    selectedTest.values,
                    selectedTest.comparison
                  )}
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
    color: '#2C3E50',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  emailText: {
    color: '#7F8C8D',
    fontSize: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#2C3E50',
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 15,
  },
  testButton: {
    backgroundColor: '#9C7EC9',
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 10,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: 'navy',
    padding: 15,
    borderRadius: 25,
    width: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom:100
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
    padding: 30,
    borderRadius: 20,
    width: '90%',
    maxHeight: '75%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2C3E50',
  },
  table: {
    width: '100%',
    marginTop: 15,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    justifyContent: 'space-between', // Ensures equal spacing between columns
    alignItems: 'center', // Ensures items are vertically aligned
  },
  tableCell: {
    flex: 2,
    fontSize: 16,
    padding: 8,
    color: '#34495E',
    textAlign: 'left',
  },
  tableValue: {
    flex: 2,
    fontSize: 16,
    padding: 8,
    color: '#34495E',
    textAlign: 'right',
  },
  comparisonImageContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonImage: {
    width: 20,
    height: 20,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    marginTop: 15,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});

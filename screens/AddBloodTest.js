import React, { useState, useEffect } from 'react';
import {
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ScrollView,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';
import { useNavigation } from '@react-navigation/native';
const { height } = Dimensions.get('window');

export default function AddBloodTest() {
  const navigation = useNavigation();
  const [igg, setIgG] = useState('');
  const [iga, setIgA] = useState('');
  const [igm, setIgM] = useState('');
  const [igg1, setIG1] = useState('');
  const [igg2, setIG2] = useState('');
  const [igg3, setIG3] = useState('');
  const [igg4, setIG4] = useState('');
  const [tetanustoxoid, setTetanusToxoid] = useState('');
  const [prp, setPrp] = useState('');
  const [pheumococcus, setPneumococcus] = useState('');
  const [antia, setAntiA] = useState('');
  const [antib, setAntiB] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users based on search query

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            birthDate: data.birthDate || null, 
            firstName: data.firstName, // Added first name for search
            lastName: data.lastName,   // Added last name for search
          };
        });
        setUsers(usersList);
        setFilteredUsers(usersList); // Initially set filtered users as all users
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const calculateAgeInMonths = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const yearsDiff = today.getFullYear() - birth.getFullYear();
    const monthsDiff = today.getMonth() - birth.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;
    return totalMonths;
  };

  const handleUserSelection = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
  };

  const handleDateChange = () => {
    if (year && month && day) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setDate(formattedDate);
      setIsDateModalVisible(false);
    } else {
      alert('Please enter a valid date.');
    }
  };

  const handleAddTest = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user.');
      return;
    }

    const ageInMonths = calculateAgeInMonths(selectedUser.birthDate);

    const emptyFields = [];
    if (!igg.trim()) emptyFields.push('IgG');
    if (!iga.trim()) emptyFields.push('IgA');
    if (!igm.trim()) emptyFields.push('IgM');
    if (!igg1.trim()) emptyFields.push('IgG1');
    if (!igg2.trim()) emptyFields.push('IgG2');
    if (!igg3.trim()) emptyFields.push('IgG3');
    if (!igg4.trim()) emptyFields.push('IgG4');
    if (!tetanustoxoid.trim()) emptyFields.push('Tetanus Toxoid');
    if (!prp.trim()) emptyFields.push('PRP');
    if (!pheumococcus.trim()) emptyFields.push('Pneumococcus');
    if (!antia.trim()) emptyFields.push('Anti A');
    if (!antib.trim()) emptyFields.push('Anti B');

    if (emptyFields.length > 0) {
      Alert.alert('Error', `Please fill out the following fields:\n${emptyFields.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'bloodTests'), {
        userId: selectedUser.id,
        age: ageInMonths,
        igg,
        iga,
        igm,
        igg1,
        igg2,
        igg3,
        igg4,
        tetanustoxoid,
        prp,
        pheumococcus,
        antia,
        antib,
        date,
      });

      Alert.alert('Success', 'Blood test added successfully.');

      // Reset the form fields after success
      setIgG('');
      setIgA('');
      setIgM('');
      setIG1('');
      setIG2('');
      setIG3('');
      setIG4('');
      setTetanusToxoid('');
      setPrp('');
      setPneumococcus('');
      setAntiA('');
      setAntiB('');
      setDate('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error adding blood test:', error);
      Alert.alert('Error', 'Failed to add blood test.');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Name or Email"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />

      <View style={styles.flatListContainer}>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userItem, selectedUser?.id === item.id && styles.selectedUser]}
              onPress={() => handleUserSelection(item.id)}
            >
              <Text style={styles.userText}>{item.email}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.createUserButton}>
          <TouchableOpacity onPress={() => navigation.navigate('Create User')}>
            <Text style={styles.createUserText}>Create User</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Form Fields (IgG, IgA, etc.) */}
        <TextInput style={styles.input} placeholder="IgG (mg/dl)" value={igg} onChangeText={setIgG} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="IgA (mg/dl)" value={iga} onChangeText={setIgA} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="IgM (mg/dl)" value={igm} onChangeText={setIgM} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="IgG1 (mg/dl)" value={igg1} onChangeText={setIG1} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="IgG2 (mg/dl)" value={igg2} onChangeText={setIG2} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="IgG3 (mg/dl)" value={igg3} onChangeText={setIG3} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="IgG4 (mg/dl)" value={igg4} onChangeText={setIG4} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Tetanus Toxoid (IU/ml)" value={tetanustoxoid} onChangeText={setTetanusToxoid} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="PRP (HIB) (ng/ml)" value={prp} onChangeText={setPrp} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Pneumococcus (ng/ml)" value={pheumococcus} onChangeText={setPneumococcus} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Isohemagglutinin Titer Anti A" value={antia} onChangeText={setAntiA} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Isohemagglutinin Titer Anti B" value={antib} onChangeText={setAntiB} placeholderTextColor="#888" />

        <TouchableOpacity onPress={() => setIsDateModalVisible(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{date || 'Select Date'}</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleAddTest} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Test'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        transparent={true}
        visible={isDateModalVisible}
        animationType="slide"
        onRequestClose={() => setIsDateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, styles.smallInput]}
                placeholder="YYYY"
                placeholderTextColor="gray"
                keyboardType="numeric"
                value={year}
                onChangeText={setYear}
                maxLength={4}
              />
              <Text style={styles.separator}>-</Text>
              <TextInput
                style={[styles.dateInput, styles.smallInput]}
                placeholder="MM"
                placeholderTextColor="gray"
                keyboardType="numeric"
                value={month}
                onChangeText={setMonth}
                maxLength={2}
              />
              <Text style={styles.separator}>-</Text>
              <TextInput
                style={[styles.dateInput, styles.smallInput]}
                placeholder="DD"
                placeholderTextColor="gray"
                keyboardType="numeric"
                value={day}
                onChangeText={setDay}
                maxLength={2}
              />
            </View>
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setIsDateModalVisible(false)} />
              <Button title="OK" onPress={handleDateChange} />
            </View>
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
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  flatListContainer: {
    marginBottom: 20,
  },
  userItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  selectedUser: {
    backgroundColor: '#d1e7dd',
  },
  userText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  createUserButton: {
    alignItems: 'center',
    backgroundColor: '#9C7EC9',
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  createUserText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
    borderRadius: 10,
    width: '30%',
  },
  smallInput: {
    width: '30%',
  },
  separator: {
    fontSize: 20,
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

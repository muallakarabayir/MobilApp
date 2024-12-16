import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface User{
    id:string;
    email: string;
}

export default function AddBloodTest(){
    const [testName, setTestName] = useState('');
    const [result, setResult] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
   
   useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users')); // 'users' koleksiyonunu çekiyoruz
        const usersList: User[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email, // Veritabanındaki email'i alıyoruz
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      }
    };

    fetchUsers();
  }, []);

  const handleAddTest = async () => {
    if (!testName || !result || !date || !selectedUserId) {
      Alert.alert('Error', 'Please fill out all fields and select a user.');
      return;
    }

    setLoading(true);

    try {
      // Kan tahlilini Firestore'a ekle
      await addDoc(collection(db, 'bloodTests'), {
        userId: selectedUserId, // Seçilen kullanıcının ID'si
        testName,
        result,
        date,
      });

      Alert.alert('Success', 'Blood test added successfully.');
      setTestName('');
      setResult('');
      setDate('');
    } catch (error) {
      console.error('Error adding blood test:', error);
      Alert.alert('Error', 'Failed to add blood test.');
    } finally {
      setLoading(false);
    }
  };
    return(
        <View style={styles.container}>
           <Text style={styles.title}>Add Blood Test</Text>
           {/*Kullanıcı seçimi*/}

           <FlatList
            data={users}
            renderItem={({item}) => (
                <TouchableOpacity
                style={[styles.userItem, selectedUserId === item.id && styles.selectedUser]}
                onPress={() => setSelectedUserId(item.id)}
                >
                    <Text style={styles.userText}>{item.email}</Text>
                </TouchableOpacity>
            )}
              keyExtractor={(item) => item.id}  
            //   style={styles.flatLisT}
              contentContainerStyle = {styles.flatListContainer}
            />
            <TextInput
            style={styles.input}
            placeholder="Test Name"
            value={testName}
            onChangeText={setTestName}
            placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Result"
                value={result}
                onChangeText={setResult}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#888"
            />

      <TouchableOpacity style={styles.button} onPress={handleAddTest} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Test'}</Text>
      </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop:15,
      marginBottom: 10,
      color: '#333',
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      fontSize: 16,
      color: '#333',
    },
    button: {
      backgroundColor: '#7f44ff',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    userItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    selectedUser: {
      backgroundColor: '#e0e0e0',
    },
    userText: {
      fontSize: 18,
    },
    flatListContainer: {
        height:60,
        marginBottom: 10, // FlatList ile input arasındaki boşluğu azaltıyoruz
    },
    flatList:{
        height:100
    }
    
  });
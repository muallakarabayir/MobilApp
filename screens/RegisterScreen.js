import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Modal, Button } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, db } from '../firebase/firebaseConfig.js';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function Register() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [firstName, setFirstName] = useState('');  // New state for first name
  const [lastName, setLastName] = useState('');    // New state for last name
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);  // Admin state
  const auth = firebaseAuth;

  const handleDateChange = () => {
    if (year && month && day) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setBirthDate(formattedDate);
      setIsModalVisible(false);
    } else {
      alert('Please enter a valid date.');
    }
  };

  const handleSignUp = async () => {
    // Şifrelerin eşleşip eşleşmediğini kontrol et
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Şifre en az 6 karakter olmalı
    if (password.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
      try {
        const userRef = await addDoc(collection(db, 'users'), {
          uid: user.uid,
          email: user.email,
          birthDate: birthDate,
          firstName: firstName,  // Save first name
          lastName: lastName,    // Save last name
          createdAt: new Date(),
          isAdmin: isAdmin,
        });
        console.log("User added to Firestore with ID: ", userRef.id);
      } catch (error) {
        console.log("Error adding user to Firestore: ", error);
      }

      alert('Check your emails!');
    } catch (error) {
      console.log(error);
      alert("Error creating user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
          placeholderTextColor="gray"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
          placeholderTextColor="gray"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="gray"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="gray"
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm Password"
          placeholderTextColor="gray"
        />
        <TouchableOpacity
          style={styles.input}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={birthDate ? styles.dateText : styles.placeholderText}>
            {birthDate || 'Select Birth Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <Text>Do you already have an account?
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}> Login Here</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Modal for Custom Date Picker */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Birth Date</Text>
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
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff',
  },
  keyboardAvoidingView: {
    alignItems: 'center',
  },
  input: {
    marginVertical: 10,
    height: 40,
    width: 300,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: 'gray',
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    width: 300,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: 'navy',
    fontWeight: 'bold',
    fontSize: 40,
    marginBottom: 20,
  },
  linkContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: "blue",
    fontSize: 16,
    fontWeight: '500',
  },
  dateText: {
    color: 'black',
  },
  placeholderText: {
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    width: "auto",
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '30%',
    alignItems: "center",
  },
  separator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
  },
});

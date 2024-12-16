import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Image, Alert } from 'react-native';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {Link} from "expo-router";
import { firebaseAuth ,db} from '../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';



export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth= firebaseAuth;

 const SigUpTestFn = async() =>{
  setLoading(true);
  try{
    const response = await createUserWithEmailAndPassword(auth, email,password);
    const user = response.user;
    console.log(response);
    // Firestore'a kullanıcı ekleme
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
    });
    alert('Check your emails!');

  }catch(error){
    console.log(error);
    
  }finally{
    setLoading(false);
  }
 }

  return (
    <View style={styles.container}>
       <Image 
                source={require('../../assets/images/—Pngtree—doctors check the health world_7265158.png')} 
                style={styles.image} 
        />
      <Text style={styles.title}>Sign Up</Text>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
       
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
          autoCapitalize='none'
          onChangeText={setPassword}
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
        <TouchableOpacity style={styles.button} onPress={SigUpTestFn} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <Link href="/" style={styles.linkText}>
                Already have an account? Login!
          </Link>
         </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', // Dikeyde ortalama
        alignItems: 'center', // Yatayda ortalama
        backgroundColor: '#ffff',
      },
      keyboardAvoidingView: {
        alignItems: 'center', // Yatayda içerikleri ortala
      },
      input: {
      marginVertical: 10,
      height: 40,
      width: 300,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      borderColor: 'gray', // Çerçeve rengi
      backgroundColor: 'white', // Arka plan rengi
      color: 'black', // Yazı rengi
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
  image: {
    width: 270,
    height: 270,
    borderRadius: 75,
    marginBottom: 20,
  },
  linkContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color:"gray",
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

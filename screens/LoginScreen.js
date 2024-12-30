import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuth, db } from '../firebase/firebaseConfig.js';
import { useState } from 'react';
import { signInWithEmailAndPassword } from '@firebase/auth';

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = firebaseAuth;
  const navigation = useNavigation();
  
  const signIn = async () => {
    setLoading(true);

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign In Successful', response);

      // Log the user information to the console
      const user = response.user;
      console.log('User Information:', user);  // Log the basic user info (UID, email, etc.)

      // If you want to log more details like user metadata (e.g., creation date)
      console.log('User Metadata:', user.metadata);  // Example: user metadata

      navigation.navigate("User");

      alert('Sign In successful!');
      
    } catch (error) {
      console.log(error);
      alert('Sign In failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/login.png')}
        style={styles.image}
      />
      <Text style={styles.title}> Welcome </Text>
      <KeyboardAvoidingView behavior='padding'>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          placeholder='Email'
          placeholderTextColor="gray"
        />
        
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder='Password'
          placeholderTextColor="gray"
        />
        <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <View>
            <Text>Don't Have A Account?
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}>
                <Text style={{
                  color: 'blue',
                  fontSize: 16,
                  fontWeight: '500'
                }}>Register Here</Text>
              </TouchableOpacity>
            </Text>
          </View>
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
    color: "navy",
    fontWeight: 'bold',
    fontSize: 40,
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
    color: "gray",
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  adminButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    width: 300,
    marginTop: 10,
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

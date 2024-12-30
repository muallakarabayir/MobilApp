import React from 'react';
import { View, Text, StyleSheet, Image,TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UserResult({ route }) {
  const { 
    testName, 
    testValue, 
    testDate, 
    previousTestValue, 
    previousTestDate, 
    previousTestAge 
  } = route.params;

  const navigation = useNavigation();

  // Karşılaştırma işlemi
  const compareValues = () => {
    // Eğer önceki test verisi yoksa, görsel ve mesaj döndürüyoruz
    if (previousTestValue === 'N/A') {
      return { result: 'No previous test data available', image: null }; // Görsel yok
    }

    const currentValue = parseFloat(testValue);
    const previousValue = parseFloat(previousTestValue);

    // Eğer mevcut değer önceki değerden büyükse
    if (currentValue > previousValue) {
      return { 
        result: 'Higher', 
        image: require('../assets/up.png')  // Yukarı ok simgesi
      };
    } 
    // Eğer mevcut değer önceki değerden küçükse
    else if (currentValue < previousValue) {
      return { 
        result: 'Lower', 
        image: require('../assets/down.png')  // Aşağı ok simgesi
      };
    } 
    // Eğer değerler eşitse
    else {
      return { 
        result: 'Equal', 
        image: require('../assets/equal.png')  // Eşit simgesi
      };
    }
  };

  const comparisonResult = compareValues();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{testName} for Test Comparison</Text>
      
      {/* Current Test Data */}
      <View style={styles.testDataContainer}>
        <Text style={styles.text}>Test Value: <Text style={styles.testValue}>{testValue}</Text></Text>
        <Text style={styles.text}>Test Date: {testDate}</Text>
      </View>

      {/* Previous Test Data */}
      {previousTestValue !== 'N/A' ? (
        <>
          <View style={styles.testDataContainer}>
            <Text style={styles.text}>Previous Test Value: <Text style={styles.testValue}>{previousTestValue}</Text></Text>
            <Text style={styles.text}>Previous Test Date: {previousTestDate}</Text>
            {/* <Text style={styles.text}>Previous Test Age: {previousTestAge}</Text> */}
          </View>
          <View style={styles.resultContainer}>
            {/* <Text style={styles.comparisonResultText}>Comparison Result: {comparisonResult.result}</Text> */}
            {comparisonResult.image && <Image source={comparisonResult.image} style={styles.comparisonImage} />}
          </View>
        </>
      ) : (
        <Text style={styles.text}>No previous test data available</Text>
      )}

       {/* Geri Git Butonu */}
       <TouchableOpacity 
        style={styles.backButton} 
        onPress={() =>{ navigation.navigate('User Compare')}} // Bir önceki sayfaya dön
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F9F9F9', // Hafif gri arka plan
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333', // Koyu gri renk
    textAlign: 'center',
    marginBottom: 20,
  },
  testDataContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Android'de gölge
  },
  text: {
    fontSize: 18,
    color: '#555', // Orta gri
    marginVertical: 5,
  },
  testValue: {
    fontWeight: 'bold',
    color: '#2A9D8F', // Canlı yeşil
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  comparisonResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comparisonImage: {
    width: 60, 
    height: 60, 
    marginTop: 10,
    resizeMode: 'contain',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#2A9D8F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

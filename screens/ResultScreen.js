import React from 'react';
import { View, Text, StyleSheet, ScrollView,Image } from 'react-native';
import downImage from '../assets/down.png'
import highImage from '../assets/up.png'
import equalImage from '../assets/equal.png'
import { ranges } from '../ranges';

const Card = ({ guideName, testName, testValue, userAge, testRange, testStatus,statusImage}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{guideName}</Text>
      <Text style={styles.cardSubtitle}>Test: {testName}</Text>
      <Text style={styles.cardSubtitle}>User Age: {userAge} months</Text>
      <Text style={styles.cardSubtitle}>Test Value: {testValue}</Text>
      {testRange && (
        <Text style={styles.cardSubtitle}>
          Normal Range: {testRange.low} - {testRange.high}
        </Text>
      )}
      {/* <Text style={styles.cardSubtitle}>Test Status: {testStatus}</Text> */}
      {/* Display the image based on status */}
             {statusImage && <Image source={statusImage} style={styles.statusImage} />}
    </View>
  );
};

const Results = ({ route }) => {
  const { dob, bloodValue, selectedTest } = route.params;

  // Kullanıcı yaşını ay cinsinden hesaplama
  const dobDate = new Date(dob);
  const currentDate = new Date();
  const ageInMonths = (currentDate.getFullYear() - dobDate.getFullYear()) * 12 + currentDate.getMonth() - dobDate.getMonth();
  const userAge = ageInMonths;

  const cards = [];

  // ranges objesindeki tüm kılavuzları gez
  for (const [guideName, tests] of Object.entries(ranges)) {
    // Her kılavuzdaki testleri kontrol et
    for (const [testName, testRanges] of Object.entries(tests)) {
      // Seçilen test ile uyumlu testleri kontrol et
      if (selectedTest === testName) {
        // Yaş aralığına uygun testi bul
        const testRange = testRanges.find((range) => {
          const [min, max] = range.ageRange.split('-').map(Number);
          return userAge >= min && userAge <= max;
        });

        if (testRange) {
          // Testin normal aralıkta olup olmadığını kontrol et
          let testStatus = '';
          let statusImage;

          if (bloodValue < testRange.low) {
            testStatus = 'Düşük';
            statusImage = require('../assets/down.png'); // Düşük için resim
          } else if (bloodValue > testRange.high) {
            testStatus = 'Yüksek';
            statusImage = require('../assets/up.png'); // Yüksek için resim
          } else {
            testStatus = 'Normal';
            statusImage = require('../assets/equal.png'); // Normal için resim
          }

          // Card bileşeni oluştur
          cards.push(
            <Card
              key={`${guideName}-${testName}`}
              guideName={guideName}
              testName={testName}
              testValue={bloodValue}
              userAge={userAge}
              testRange={testRange}
              testStatus={testStatus}
              statusImage={statusImage}
            />
          );
        }
      }
    }
  }

  return <ScrollView style={styles.container}>{cards}</ScrollView>;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  statusImage: {
    width: 50,
    height: 50,
    marginTop: 10,
    
  },
});

export default Results;

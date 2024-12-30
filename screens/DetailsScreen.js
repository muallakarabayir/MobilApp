import React, { useEffect } from 'react';
import { View, Text, StyleSheet,Image,ScrollView } from 'react-native';
import { useState } from 'react';
import { ranges } from '../ranges';
import {downImage} from '../assets/down.png'
import {equalImage} from '../assets/equal.png'
import {upImage} from '../assets/up.png'

const Card = ({ guideName, testName, testValue, userAge, testRange, testStatus,statusImage }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{guideName}</Text>
      <Text style={styles.cardSubtitle}>Test: {testName}</Text>
      <Text style={styles.cardSubtitle}>User Age: {userAge}</Text>
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

export default function Details({ route }) {
  const { testName, testValue, userAge } = route.params;
  const [testRange, setTestRange] = useState(null);
  const [testStatus, setTestStatus] = useState('');
  const [guideName, setGuideName] = useState('');
  const [statusImage, setStatusImage] = useState(null);  // State to hold the image

  // Find the correct test range and guide name based on testName and userAge
  useEffect(() => {
    const findTestRange = () => {
      // Iterate over the guide names in ranges
      for (const guide in ranges) {
        const testRanges = ranges[guide][testName];

        if (testRanges) {
          // Set the guide name
          setGuideName(guide);

          // Find the appropriate range for the user's age
          for (let i = 0; i < testRanges.length; i++) {
            const range = testRanges[i];
            const [minAge, maxAge] = range.ageRange.split('-').map(Number);

            if (userAge >= minAge && userAge <= maxAge) {
              setTestRange(range);
              break;
            }
          }
          break;
        }
      }
    };

    // Call the function to find the test range
    findTestRange();
  }, [testName, userAge]);

  // Evaluate the test value (check if it is within range)
  useEffect(() => {
    if (testRange) {
      if (testValue < testRange.low) {
        setTestStatus('Low');
        setStatusImage(require('../assets/down.png'));
      } else if (testValue > testRange.high) {
        setTestStatus('High');
        setStatusImage(require('../assets/up.png'));
      } else {
        setTestStatus('Normal');
        setStatusImage('../assets/equal.png');
      }
    }
  }, [testValue, testRange]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test Details</Text>

      {/* Iterate over all guides */}
      {Object.keys(ranges).map((guide) => (
        <Card
          key={guide}
          guideName={guide}
          testName={testName}
          testValue={testValue}
          userAge={userAge}
          testRange={testRange}
          testStatus={testStatus}
          statusImage={statusImage}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    marginVertical: 5,
  },
  statusImage: {
    width: 50,
    height: 50,
    marginTop: 10,
    
  },
});
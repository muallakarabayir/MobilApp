import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import firestore from 'firebase/firestore';

const CreateGuide = () => {
    const [guideName, setGuideName] = useState('');
    const [testName, setTestName] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [lowValue, setLowValue] = useState('');
    const [highValue, setHighValue] = useState('');
    const [status, setStatus] = useState('');

    const handleAddTest = async () => {
        if (!guideName || !testName || !ageRange || !lowValue || !highValue) {
            setStatus('Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            const newTest = { ageRange, low: parseFloat(lowValue), high: parseFloat(highValue) };
            
            // Firestore'da kılavuz adıyla bir koleksiyon/doküman oluştur
            const guideRef = firestore().collection('guides').doc(guideName);

            // Kılavuz içinde test ekle veya güncelle
            const guideDoc = await guideRef.get();
            if (guideDoc.exists) {
                const currentData = guideDoc.data();
                const updatedData = {
                    ...currentData,
                    [testName]: currentData[testName]
                        ? [...currentData[testName], newTest] // Var olan teste ekleme
                        : [newTest], // Yeni test oluşturma
                };
                await guideRef.set(updatedData);
            } else {
                await guideRef.set({
                    [testName]: [newTest],
                });
            }

            setStatus('Test başarıyla eklendi!');
            setTestName('');
            setAgeRange('');
            setLowValue('');
            setHighValue('');
        } catch (error) {
            console.error(error);
            setStatus('Hata oluştu: ' + error.message);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Kılavuz Adı"
                value={guideName}
                onChangeText={setGuideName}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Test Adı"
                value={testName}
                onChangeText={setTestName}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Yaş Aralığı (ör. 0-1)"
                value={ageRange}
                onChangeText={setAgeRange}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="En Düşük Değer"
                value={lowValue}
                onChangeText={setLowValue}
                keyboardType="numeric"
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="En Yüksek Değer"
                value={highValue}
                onChangeText={setHighValue}
                keyboardType="numeric"
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button title="Testi Ekle" onPress={handleAddTest} />
            {status ? <Text style={{ marginTop: 20 }}>{status}</Text> : null}
        </View>
    );
};

export default CreateGuide;

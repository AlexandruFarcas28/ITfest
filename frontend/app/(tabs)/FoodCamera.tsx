import React from 'react';
import { Alert, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import InteractivePressable from '../../src/components/InteractivePressable';
import { commonStyles } from '../../src/styles/common';

export type FoodPhoto = {
  uri: string;
  width: number;
  height: number;
  source: 'camera' | 'gallery';
};

type FoodCameraProps = {
  onCapture: (photo: FoodPhoto) => void;
  onDismiss?: () => void;
};

export default function FoodCamera({ onCapture, onDismiss }: FoodCameraProps) {
  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permisiune necesara', 'Aplicatia are nevoie de acces la camera.');
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (response.canceled || !response.assets?.[0]) {
      onDismiss?.();
      return;
    }

    const asset = response.assets[0];
    onCapture({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      source: 'camera',
    });
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permisiune necesara', 'Aplicatia are nevoie de acces la galerie.');
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (response.canceled || !response.assets?.[0]) {
      onDismiss?.();
      return;
    }

    const asset = response.assets[0];
    onCapture({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      source: 'gallery',
    });
  };

  return (
    <View style={{ gap: 12 }}>
      <InteractivePressable style={commonStyles.primaryButton} onPress={handleOpenCamera}>
        <Text style={commonStyles.primaryButtonText}>Open Camera</Text>
      </InteractivePressable>

      <InteractivePressable style={commonStyles.secondaryButton} onPress={handlePickFromGallery}>
        <Text style={commonStyles.secondaryButtonText}>Choose From Gallery</Text>
      </InteractivePressable>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { listMedia } from '@/utils/firebase';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MirrorPreview() {
  const [photos, setPhotos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchPhotos() {
      const media = await listMedia('mirrormoment', '1');
      const sorted = Array.isArray(media)
        ? [...media].sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA;
          })
        : [];
      setPhotos(sorted.slice(0, 2));
    }
    fetchPhotos();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mirror Moments</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          {photos.map((photo, idx) => (
            <View key={photo.url || idx} style={styles.photoCol}>
              <Image
                source={{ uri: photo.url || photo.thumbnail_url }}
                style={styles.photo}
              />
              <Text style={styles.date}>{formatDate(photo.date)}</Text>
            </View>
          ))}
          <Pressable
            style={[styles.photoCol, styles.addCol]}
            onPress={() => router.push('/member/mirrormoment/capture')}
          >
            <View style={styles.addIconWrap}>
              <Ionicons name="add" size={32} color="#2563FF" />
            </View>
            <Text style={styles.addText}>Add a photo</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.scanButton}
          onPress={() => router.push('/member/mirrormoment')}
        >
          <Text style={styles.scanButtonText}>See My AI Progress Scan</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  photoCol: {
    flex: 1,
    height: ((SCREEN_WIDTH - 80) / 3) * 1.3,
    alignItems: 'center',
    marginRight: 8,
  },
  photo: {
    width: (SCREEN_WIDTH - 80) / 3,
    height: ((SCREEN_WIDTH - 80) / 3) * 1.3,
    borderRadius: 16,
    backgroundColor: '#181A20',
  },
  date: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  addCol: {
    backgroundColor: '#181A20',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    minHeight: 120,
  },
  addIconWrap: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 8,
    marginBottom: 6,
  },
  addText: {
    color: '#9BA9BD',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 80,
  },
  scanButton: {
    backgroundColor: '#2563FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
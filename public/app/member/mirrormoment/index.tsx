import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listMedia, uploadMedia, deleteMedia } from '@/utils/firebase';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH / 3.5;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.3;
const CARD_HEIGHT = CARD_IMAGE_HEIGHT + 24; // 24px for date

export default function MirrorMoment() {
  const [gallery, setGallery] = useState([]);
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const router = useRouter();

  const fetchGallery = async () => {
    setIsUploading(true);
    const media = await listMedia('mirrormoment', '1');
    const mediaArr = Array.isArray(media) ? media : [];
    setGallery(mediaArr.map(m => ({ 
      ...m,
      url: m.thumbnail_url || m.url, 
      date: new Date(m.date).toLocaleDateString('en-IN',{ month: 'short', day: 'numeric' })
    })));
    setIsUploading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Refresh gallery when returning to this page
  useFocusEffect(
    React.useCallback(() => {
      fetchGallery();
    }, [])
  );

  const handleSelect = (img) => {
    // If clicking on an already selected image, deselect it
    if (before && before.url === img.url) { // deselect before
      setBefore(null);
    } else if (after && after.url === img.url) { // deselect after
      setAfter(null);
    } else if (!before) { // set before
      setBefore(img);
    } else if (!after) { // set after
      setAfter(img);
    } else { // replace after
      setAfter(img);
    }
  };

  const handleDelete = async (img) => {
    setIsUploading(true);
    try {
      await deleteMedia(null, 'mirrormoment', '1', img.mediaId);
      await fetchGallery();
    } catch (e) {
      alert('Failed to delete photo.');
    }
    setIsUploading(false);
  };

  const handleAnalyze = () => {
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);
  const closeUploadModal = () => setUploadModalVisible(false);

  const handleUploadButton = () => {
    setUploadModalVisible(true);
  };

  const handleCapture = () => {
    closeUploadModal();
    router.push('./capture', {relativeToDirectory: true});
  };

  const handleGallery = async () => {
    closeUploadModal();
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uploadResult = await uploadMedia(
          result.assets[0],
          null,
          'mirrormoment',
          '1'
        );
        await fetchGallery();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image from gallery.');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={{ position: 'absolute', top: 24, left: 16, zIndex: 10, padding: 8 }}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>
      <Text style={[styles.title, { marginTop: 8 }]}>Compare Progress</Text>
      <View style={styles.compareRow}>
        <View style={styles.compareCol}>
          <Pressable style={styles.imagePicker} onPress={() => {}}>
            {before ? (
              <Image source={{ uri: before.url }} style={styles.compareImage} />
            ) : (
              <Ionicons name="image" size={32} color="#9BA9BD" />
            )}
          </Pressable>
          <Text style={styles.compareDate}>{before ? before.date : 'Select'}</Text>
        </View>
        <View style={styles.compareCol}>
          <Pressable style={styles.imagePicker} onPress={() => {}}>
            {after ? (
              <Image source={{ uri: after.url }} style={styles.compareImage} />
            ) : (
              <Ionicons name="image" size={32} color="#9BA9BD" />
            )}
          </Pressable>
          <Text style={styles.compareDate}>{after ? after.date : 'Select'}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 18 }}>
        <Text style={[styles.galleryTitle, {marginLeft: 12}]}>Choose pics to compare</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryRow}>
        {gallery.map((img, idx) => (
          <View
            key={img.thumbnail_url}
            style={[
              styles.galleryImageWrap,
              (before && before.url === img.url) || (after && after.url === img.url)
                ? styles.galleryImageSelected
                : null,
              idx !== gallery.length - 1 ? { marginRight: 16 } : {},
            ]}
          >
            <Pressable onPress={() => handleSelect(img)} style={{width: CARD_WIDTH, height: CARD_IMAGE_HEIGHT}} onLongPress={() => setShowTrash((v) => !v)}>
              <Image source={{ uri: img.url }} style={styles.galleryImage} />
            </Pressable>
            <Text style={styles.galleryDate}>{img.date}</Text>
            {showTrash && (
              <Pressable
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 12,
                  padding: 4,
                  zIndex: 10,
                }}
                onPress={() => handleDelete(img)}
              >
                <Ionicons name="trash" size={18} color="#fff" />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
      <Pressable
        style={[styles.analyzeButton, before && after ? styles.analyzeButtonActive : null]}
        onPress={before && after ? handleAnalyze : undefined}
        disabled={!(before && after)}
      >
        <Text style={styles.analyzeButtonText}>Compare now</Text>
      </Pressable>
      <Pressable
        style={styles.uploadButton}
        onPress={handleUploadButton}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="camera" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.uploadButtonText}>Upload Selfie</Text>
          </>
        )}
      </Pressable>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Pressable style={styles.modalClose} onPress={closeModal}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.modalTitle}>Progress: {before?.date} - {after?.date}</Text>
            <View style={styles.modalCompareRow}>
              <Image source={{ uri: before?.url }} style={styles.modalCompareImage} />
              <Image source={{ uri: after?.url }} style={styles.modalCompareImage} />
            </View>
            <View style={styles.modalReportBox}>
              <Text style={styles.modalReportText}>
                Analysis coming soon! Keep showing up and we'll keep improving!
              </Text>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButton} onPress={closeModal}>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={closeModal}>
                <Ionicons name="share" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Share</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeUploadModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalCard}>
            <Pressable style={styles.modalClose} onPress={closeUploadModal}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.modalTitle}>Upload Photo</Text>
            <Text style={styles.modalSubtitle}>Choose how you want to add a photo</Text>
            
            <Pressable style={styles.uploadOption} onPress={handleCapture}>
              <View style={styles.uploadOptionIcon}>
                <Ionicons name="camera" size={32} color="#2563FF" />
              </View>
              <View style={styles.uploadOptionContent}>
                <Text style={styles.uploadOptionTitle}>Capture Photo</Text>
                <Text style={styles.uploadOptionSubtitle}>Take a new photo with your camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9BA9BD" />
            </Pressable>
            
            <Pressable style={styles.uploadOption} onPress={handleGallery}>
              <View style={styles.uploadOptionIcon}>
                <Ionicons name="images" size={32} color="#2563FF" />
              </View>
              <View style={styles.uploadOptionContent}>
                <Text style={styles.uploadOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.uploadOptionSubtitle}>Select an existing photo from your device</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9BA9BD" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C16',
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 18,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  compareCol: {
    alignItems: 'center',
    flex: 1,
  },
  imagePicker: {
    width: SCREEN_WIDTH * 0.38,
    height: SCREEN_WIDTH * 0.5,
    backgroundColor: '#181A20',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compareImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 24,
  },
  compareDate: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  galleryTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 8,
    alignSelf: 'center',
  },
  galleryRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
    height: CARD_HEIGHT,
  },
  galleryImageWrap: {
    alignItems: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#181A20',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  galleryImageSelected: {
    borderColor: '#2563FF',
  },
  galleryImage: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    borderRadius: 18,
    resizeMode: 'cover',
  },
  galleryDate: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 0,
    alignSelf: 'center',
  },
  analyzeButton: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  analyzeButtonActive: {
    backgroundColor: '#2563FF',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#2563FF',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    maxWidth: SCREEN_WIDTH - 40,
    maxHeight: '80%',
  },
  uploadModalCard: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 24,
    margin: 20,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#9BA9BD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCompareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCompareImage: {
    width: (SCREEN_WIDTH - 88) / 2,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  modalReportTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalReportBox: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalReportText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  green: {
    color: '#10B981',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#2563FF',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  uploadOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#23262F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  uploadOptionContent: {
    flex: 1,
  },
  uploadOptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  uploadOptionSubtitle: {
    color: '#9BA9BD',
    fontSize: 14,
  },
}); 
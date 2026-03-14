import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS } from '../../src/styles/theme';
import InteractivePressable from '../../src/components/InteractivePressable';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Icons (SVG inline) ───────────────────────────────────────────────────────

function IconCamera({ size = 28, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Simple SVG-like camera shape via views */}
      <View
        style={{
          width: size,
          height: size * 0.75,
          borderRadius: 6,
          borderWidth: 2.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <View
          style={{
            width: size * 0.38,
            height: size * 0.38,
            borderRadius: size * 0.19,
            borderWidth: 2,
            borderColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -8,
            left: size * 0.15,
            width: size * 0.28,
            height: 8,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: color,
            borderBottomWidth: 0,
          }}
        />
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FoodCamera({ onCapture, onDismiss }: FoodCameraProps) {
  const [visible, setVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [preview, setPreview] = useState<FoodPhoto | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const shutterScale = useRef(new Animated.Value(1)).current;

  // ── Open camera modal ──────────────────────────────────────────────────────
  const open = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setPreview(null);
    setVisible(true);
  }, [permission, requestPermission]);

  const close = useCallback(() => {
    setVisible(false);
    setPreview(null);
    onDismiss?.();
  }, [onDismiss]);

  // ── Shutter animation ──────────────────────────────────────────────────────
  const animateShutter = useCallback(() => {
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(shutterScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  }, [shutterScale]);

  // ── Take photo ─────────────────────────────────────────────────────────────
  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isBusy) return;
    setIsBusy(true);
    animateShutter();

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) {
        const result: FoodPhoto = {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          source: 'camera',
        };
        setPreview(result);
      }
    } catch (e) {
      console.warn('Camera capture error:', e);
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, animateShutter]);

  // ── Pick from gallery ──────────────────────────────────────────────────────
  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const photo: FoodPhoto = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        source: 'gallery',
      };
      setPreview(photo);
      setVisible(true);
    }
  }, []);

  // ── Confirm photo ──────────────────────────────────────────────────────────
  const confirmPhoto = useCallback(() => {
    if (!preview) return;
    onCapture(preview);
    close();
  }, [preview, onCapture, close]);

  const retake = useCallback(() => {
    setPreview(null);
  }, []);

  const flipCamera = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  // ── Trigger button (shown in main UI) ─────────────────────────────────────
  return (
    <>
      {/* Entry buttons */}
      <View style={styles.entryRow}>
        <InteractivePressable onPress={open} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>📷  Fotografiază mâncarea</Text>
        </InteractivePressable>

        <InteractivePressable onPress={pickFromGallery} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>🖼</Text>
        </InteractivePressable>
      </View>

      {/* Camera Modal */}
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={close}>
        <View style={styles.modalRoot}>

          {/* ── Preview mode ── */}
          {preview ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: preview.uri }} style={styles.previewImage} resizeMode="cover" />

              <View style={styles.previewOverlay}>
                <Text style={styles.previewLabel}>Arată bine?</Text>

                <View style={styles.previewActions}>
                  <InteractivePressable onPress={retake} style={styles.retakeBtn}>
                    <Text style={styles.retakeBtnText}>↩  Refă</Text>
                  </InteractivePressable>

                  <InteractivePressable onPress={confirmPhoto} style={styles.confirmBtn}>
                    <Text style={styles.confirmBtnText}>✓  Folosește poza</Text>
                  </InteractivePressable>
                </View>
              </View>
            </View>

          ) : (
            /* ── Camera viewfinder ── */
            <>
              <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                {/* Framing guide */}
                <View style={styles.frameGuide} pointerEvents="none">
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  <Text style={styles.frameHint}>Încadrează mâncarea</Text>
                </View>
              </CameraView>

              {/* Controls bar */}
              <View style={styles.controls}>
                {/* Gallery shortcut */}
                <InteractivePressable onPress={pickFromGallery} style={styles.sideBtn}>
                  <Text style={styles.sideBtnText}>🖼</Text>
                </InteractivePressable>

                {/* Shutter */}
                <Animated.View style={{ transform: [{ scale: shutterScale }] }}>
                  <Pressable
                    onPress={takePicture}
                    disabled={isBusy}
                    style={styles.shutter}
                  >
                    {isBusy
                      ? <ActivityIndicator color={COLORS.accentDark} />
                      : <View style={styles.shutterInner} />
                    }
                  </Pressable>
                </Animated.View>

                {/* Flip */}
                <InteractivePressable onPress={flipCamera} style={styles.sideBtn}>
                  <Text style={styles.sideBtnText}>🔄</Text>
                </InteractivePressable>
              </View>
            </>
          )}

          {/* Close button */}
          <InteractivePressable onPress={close} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </InteractivePressable>
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Entry
  entryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.accentDark,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 20,
  },

  // Modal
  modalRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },

  // Frame guide
  frameGuide: {
    flex: 1,
    margin: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: COLORS.accent,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 32, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 32, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  frameHint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    paddingVertical: 28,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnText: {
    fontSize: 22,
  },

  // Close
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Preview
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    padding: 28,
    paddingBottom: 48,
    gap: 20,
  },
  previewLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.accentDark,
    fontSize: 15,
    fontWeight: '800',
  },
});
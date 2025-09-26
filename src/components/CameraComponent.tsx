import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { CameraView,  useCameraPermissions } from 'expo-camera';
import { CameraType } from 'expo-image-picker';


type CameraComponentProps = {
  type?: CameraType;
  onClose?: () => void;
};

export type CameraComponentRef = {
  takePicture: () => Promise<string | null>;
};

const CameraComponent = forwardRef<CameraComponentRef, CameraComponentProps>(
  ({ type = CameraType.back, onClose }, ref) => {
    const [facing, setFacing] = useState<CameraType>(type);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);

    // Exponer la función para tomar foto
    useImperativeHandle(ref, () => ({
      takePicture: async () => {
        if (!cameraRef.current) {
          Alert.alert('Error', 'La cámara no está lista.');
          return null;
        }
        try {
          const photo = await cameraRef.current.takePictureAsync();
          return photo.uri;
        } catch (error) {
          Alert.alert('Error', 'No se pudo tomar la foto.');
          return null;
        }
      },
    }));

    if (!permission) {
      // Permisos aún cargando
      return <View style={styles.permissionContainer} />;
    }

    if (!permission.granted) {
      // Permisos no concedidos
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>Necesitamos permiso para acceder a la cámara</Text>
          <Button onPress={requestPermission} title="Conceder permiso" />
          {onClose && <Button onPress={onClose} title="Cerrar" />}
        </View>
      );
    }

    const toggleCameraFacing = () => {
      setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    };

    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} ref={cameraRef} facing={facing} />

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Cambiar cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (ref && typeof (ref as any).current?.takePicture === 'function') {
                const uri = await (ref as any).current.takePicture();
                if (uri) {
                  Alert.alert('Foto tomada', `URI: ${uri}`);
                }
              }
            }}
          >
            <Text style={styles.text}>Tomar foto</Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.text}>Cerrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1e90ff',
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginBottom: 10,
    fontSize: 16,
  },
});

export default CameraComponent;

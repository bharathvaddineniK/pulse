import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import Button from './Button';

interface EditLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newLabel: string) => void;
  initialLabel: string;
}

const EditLocationModal = ({ visible, onClose, onSave, initialLabel }: EditLocationModalProps) => {
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    if (visible) {
      setLabel(initialLabel);
    }
  }, [visible, initialLabel]);

  const handleSave = () => {
    if (label.trim()) {
      onSave(label.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={Typography.h2}>Edit Label</Text>
          <Text style={styles.subtext}>Enter a new label for this location.</Text>
          <TextInput
            style={styles.input}
            placeholder="Label"
            placeholderTextColor={Colors.textSecondary}
            value={label}
            onChangeText={setLabel}
            autoFocus={true}
            defaultValue={initialLabel}
          />
          <View style={styles.buttonContainer}>
            <Button title="Save Changes" onPress={handleSave} />
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                <Text style={Typography.body}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    width: '90%',
  },
  subtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
   secondaryButton: {
    marginTop: 12,
    padding: 10,
    alignItems: 'center',
  }
});

export default EditLocationModal;